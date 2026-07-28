import { Router } from 'express';
import { and, eq, inArray, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { agendaEventShares, agendaEvents, friendRequests, users } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { createAgendaEventSchema, shareAgendaEventSchema, updateAgendaEventSchema } from '../validation.js';

export const agendaRouter = Router();
agendaRouter.use(requireAuth);

async function friendIds(userId: string): Promise<Set<string>> {
  const accepted = await db
    .select()
    .from(friendRequests)
    .where(
      and(eq(friendRequests.status, 'accepted'), or(eq(friendRequests.requesterId, userId), eq(friendRequests.addresseeId, userId))),
    );
  return new Set(accepted.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId)));
}

// Creates pending agenda_event_shares rows for `ids`, silently skipping any id that isn't
// actually a friend or already has a pending/accepted share for this event.
async function createShares(eventId: string, fromUserId: string, ids: string[]) {
  const friends = await friendIds(fromUserId);
  const validIds = ids.filter((id) => friends.has(id));
  if (validIds.length === 0) return [];

  const existing = await db
    .select({ toUserId: agendaEventShares.toUserId })
    .from(agendaEventShares)
    .where(and(eq(agendaEventShares.eventId, eventId), inArray(agendaEventShares.toUserId, validIds)));
  const already = new Set(existing.map((r) => r.toUserId));
  const newIds = validIds.filter((id) => !already.has(id));
  if (newIds.length === 0) return [];

  return db
    .insert(agendaEventShares)
    .values(newIds.map((toUserId) => ({ eventId, fromUserId, toUserId })))
    .returning();
}

agendaRouter.get('/', async (req, res) => {
  const events = await db.query.agendaEvents.findMany({ where: eq(agendaEvents.userId, req.userId!) });
  res.json({ events });
});

agendaRouter.post('/', async (req, res) => {
  const parsed = createAgendaEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
  const { shareWithFriendIds, ...data } = parsed.data;
  const me = req.userId!;

  const [event] = await db
    .insert(agendaEvents)
    .values({ ...data, userId: me })
    .returning();

  const shares = shareWithFriendIds?.length ? await createShares(event.id, me, shareWithFriendIds) : [];

  res.status(201).json({ event, shares });
});

agendaRouter.patch('/:id', async (req, res) => {
  const parsed = updateAgendaEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [event] = await db
    .update(agendaEvents)
    .set(parsed.data)
    .where(and(eq(agendaEvents.id, req.params.id), eq(agendaEvents.userId, req.userId!)))
    .returning();

  if (!event) {
    res.status(404).json({ error: 'Evento não encontrado' });
    return;
  }
  res.json(event);
});

agendaRouter.delete('/:id', async (req, res) => {
  const [deleted] = await db
    .delete(agendaEvents)
    .where(and(eq(agendaEvents.id, req.params.id), eq(agendaEvents.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Evento não encontrado' });
    return;
  }
  res.status(204).end();
});

agendaRouter.post('/:id/share', async (req, res) => {
  const parsed = shareAgendaEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
  const me = req.userId!;

  const [event] = await db
    .select()
    .from(agendaEvents)
    .where(and(eq(agendaEvents.id, req.params.id), eq(agendaEvents.userId, me)));
  if (!event) {
    res.status(404).json({ error: 'Evento não encontrado' });
    return;
  }

  const shares = await createShares(event.id, me, parsed.data.friendIds);
  res.status(201).json({ shares });
});

agendaRouter.get('/shares', async (req, res) => {
  const me = req.userId!;
  const pending = await db
    .select()
    .from(agendaEventShares)
    .where(and(eq(agendaEventShares.toUserId, me), eq(agendaEventShares.status, 'pending')));

  if (pending.length === 0) {
    res.json([]);
    return;
  }

  const eventIds = [...new Set(pending.map((s) => s.eventId))];
  const fromIds = [...new Set(pending.map((s) => s.fromUserId))];
  const [eventRows, userRows] = await Promise.all([
    db.select().from(agendaEvents).where(inArray(agendaEvents.id, eventIds)),
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, fromIds)),
  ]);
  const eventById = new Map(eventRows.map((e) => [e.id, e]));
  const userById = new Map(userRows.map((u) => [u.id, u]));

  const shares = pending
    .map((s) => {
      const event = eventById.get(s.eventId);
      const from = userById.get(s.fromUserId);
      if (!event || !from) return null;
      return {
        id: s.id,
        event: { id: event.id, title: event.title, notes: event.notes, date: event.date, time: event.time },
        from,
      };
    })
    .filter((s) => s !== null);

  res.json(shares);
});

agendaRouter.post('/shares/:id/accept', async (req, res) => {
  const me = req.userId!;
  const [share] = await db
    .select()
    .from(agendaEventShares)
    .where(and(eq(agendaEventShares.id, req.params.id), eq(agendaEventShares.toUserId, me), eq(agendaEventShares.status, 'pending')));

  if (!share) {
    res.status(404).json({ error: 'Convite não encontrado' });
    return;
  }

  const [sourceEvent] = await db.select().from(agendaEvents).where(eq(agendaEvents.id, share.eventId));
  if (!sourceEvent) {
    res.status(404).json({ error: 'Evento original não encontrado' });
    return;
  }

  const [event] = await db
    .insert(agendaEvents)
    .values({
      userId: me,
      title: sourceEvent.title,
      notes: sourceEvent.notes,
      date: sourceEvent.date,
      time: sourceEvent.time,
      sharedFromUserId: share.fromUserId,
    })
    .returning();

  await db.update(agendaEventShares).set({ status: 'accepted' }).where(eq(agendaEventShares.id, share.id));

  res.status(201).json({ event });
});

// Declining an incoming invite or cancelling one already sent — both a delete of the pending row.
agendaRouter.delete('/shares/:id', async (req, res) => {
  const me = req.userId!;
  const [deleted] = await db
    .delete(agendaEventShares)
    .where(
      and(
        eq(agendaEventShares.id, req.params.id),
        eq(agendaEventShares.status, 'pending'),
        or(eq(agendaEventShares.toUserId, me), eq(agendaEventShares.fromUserId, me)),
      ),
    )
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Convite não encontrado' });
    return;
  }
  res.status(204).end();
});
