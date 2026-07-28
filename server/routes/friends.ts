import { Router } from 'express';
import { and, eq, inArray, or } from 'drizzle-orm';
import { db } from '../db/client.js';
import { friendRequests, users } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { sendFriendRequestSchema } from '../validation.js';

export const friendsRouter = Router();
friendsRouter.use(requireAuth);

// Friend requests have no separate "friendship" table: a 'pending' row is a request, and it
// becomes the friendship record itself once accepted (status flips to 'accepted'). Declining a
// request, cancelling a sent request, and unfriending are all the same operation — deleting the
// row — so there's no 'declined' status to track.

async function otherPartyUsers(otherIds: string[]) {
  if (otherIds.length === 0) return new Map<string, { id: string; name: string; email: string }>();
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(inArray(users.id, otherIds));
  return new Map(rows.map((u) => [u.id, u]));
}

friendsRouter.get('/', async (req, res) => {
  const me = req.userId!;
  const accepted = await db
    .select()
    .from(friendRequests)
    .where(and(eq(friendRequests.status, 'accepted'), or(eq(friendRequests.requesterId, me), eq(friendRequests.addresseeId, me))));

  const otherIds = accepted.map((r) => (r.requesterId === me ? r.addresseeId : r.requesterId));
  const userById = await otherPartyUsers(otherIds);

  const friends = accepted
    .map((r) => {
      const otherId = r.requesterId === me ? r.addresseeId : r.requesterId;
      const u = userById.get(otherId);
      return u ? { requestId: r.id, id: u.id, name: u.name, email: u.email } : null;
    })
    .filter((f) => f !== null);

  res.json(friends);
});

friendsRouter.get('/requests', async (req, res) => {
  const me = req.userId!;
  const pending = await db
    .select()
    .from(friendRequests)
    .where(and(eq(friendRequests.status, 'pending'), or(eq(friendRequests.requesterId, me), eq(friendRequests.addresseeId, me))));

  const otherIds = pending.map((r) => (r.requesterId === me ? r.addresseeId : r.requesterId));
  const userById = await otherPartyUsers(otherIds);

  const incoming = pending
    .filter((r) => r.addresseeId === me)
    .map((r) => {
      const u = userById.get(r.requesterId);
      return u ? { requestId: r.id, id: u.id, name: u.name, email: u.email } : null;
    })
    .filter((r) => r !== null);

  const outgoing = pending
    .filter((r) => r.requesterId === me)
    .map((r) => {
      const u = userById.get(r.addresseeId);
      return u ? { requestId: r.id, id: u.id, name: u.name, email: u.email } : null;
    })
    .filter((r) => r !== null);

  res.json({ incoming, outgoing });
});

friendsRouter.post('/requests', async (req, res) => {
  const parsed = sendFriendRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
  const me = req.userId!;

  const [target] = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email));
  if (!target) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  if (target.id === me) {
    res.status(400).json({ error: 'Você não pode adicionar a si mesmo' });
    return;
  }

  const [existing] = await db
    .select()
    .from(friendRequests)
    .where(
      or(
        and(eq(friendRequests.requesterId, me), eq(friendRequests.addresseeId, target.id)),
        and(eq(friendRequests.requesterId, target.id), eq(friendRequests.addresseeId, me)),
      ),
    );
  if (existing) {
    res.status(400).json({
      error: existing.status === 'accepted' ? 'Vocês já são amigos' : 'Já existe uma solicitação pendente',
    });
    return;
  }

  const [request] = await db
    .insert(friendRequests)
    .values({ requesterId: me, addresseeId: target.id })
    .returning();

  res.status(201).json(request);
});

friendsRouter.post('/requests/:id/accept', async (req, res) => {
  const me = req.userId!;
  const [updated] = await db
    .update(friendRequests)
    .set({ status: 'accepted' })
    .where(
      and(eq(friendRequests.id, req.params.id), eq(friendRequests.addresseeId, me), eq(friendRequests.status, 'pending')),
    )
    .returning();

  if (!updated) {
    res.status(404).json({ error: 'Solicitação não encontrada' });
    return;
  }
  res.json(updated);
});

// Covers declining an incoming request, cancelling a sent one, and unfriending — all a delete of
// the same row, allowed to either party.
friendsRouter.delete('/:id', async (req, res) => {
  const me = req.userId!;
  const [deleted] = await db
    .delete(friendRequests)
    .where(and(eq(friendRequests.id, req.params.id), or(eq(friendRequests.requesterId, me), eq(friendRequests.addresseeId, me))))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Não encontrado' });
    return;
  }
  res.status(204).end();
});
