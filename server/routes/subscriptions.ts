import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { accounts, entries, subscriptions } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { createSubscriptionSchema, updateSubscriptionSchema } from '../validation.js';
import { dayOfMonth, nextChargeDateFor, todayISO } from '../lib/dates.js';
import { chargeOverdueCycles } from '../jobs/billSubscriptions.js';

export const subscriptionsRouter = Router();
subscriptionsRouter.use(requireAuth);

subscriptionsRouter.post('/', async (req, res) => {
  const parsed = createSubscriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
  const { chargeNow, ...data } = parsed.data;

  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.id, data.accountId), eq(accounts.userId, req.userId!)),
  });
  if (!account) {
    res.status(404).json({ error: 'Conta não encontrada' });
    return;
  }

  const billingDay = data.cadence === 'monthly' ? dayOfMonth(data.nextChargeDate) : null;

  const [subscription] = await db
    .insert(subscriptions)
    .values({ ...data, billingDay, userId: req.userId! })
    .returning();

  let current = subscription;
  const createdEntries = [];

  if (chargeNow) {
    const today = todayISO();
    const [entry] = await db
      .insert(entries)
      .values({
        userId: req.userId!,
        accountId: current.accountId,
        subscriptionId: current.id,
        date: today,
        desc: current.name,
        amount: -current.price,
        categoryId: 'assinaturas',
        retro: false,
      })
      .returning();
    createdEntries.push(entry);

    const [updated] = await db
      .update(subscriptions)
      .set({ lastChargeDate: today, nextChargeDate: nextChargeDateFor(today, current) })
      .where(eq(subscriptions.id, current.id))
      .returning();
    current = updated;
  }

  // Catches up any cycles still overdue (e.g. a backdated "próxima cobrança") instead of
  // waiting for the next hourly billing pass.
  const caughtUp = await chargeOverdueCycles(current);
  current = caughtUp.subscription;
  createdEntries.push(...caughtUp.entries);

  res.status(201).json({ subscription: current, entries: createdEntries });
});

subscriptionsRouter.patch('/:id', async (req, res) => {
  const parsed = updateSubscriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.id, parsed.data.accountId), eq(accounts.userId, req.userId!)),
  });
  if (!account) {
    res.status(404).json({ error: 'Conta não encontrada' });
    return;
  }

  const billingDay = parsed.data.cadence === 'monthly' ? dayOfMonth(parsed.data.nextChargeDate) : null;

  const [subscription] = await db
    .update(subscriptions)
    .set({ ...parsed.data, billingDay })
    .where(and(eq(subscriptions.id, req.params.id), eq(subscriptions.userId, req.userId!)))
    .returning();

  if (!subscription) {
    res.status(404).json({ error: 'Assinatura não encontrada' });
    return;
  }

  res.json(subscription);
});

subscriptionsRouter.delete('/:id', async (req, res) => {
  const [deleted] = await db
    .delete(subscriptions)
    .where(and(eq(subscriptions.id, req.params.id), eq(subscriptions.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Assinatura não encontrada' });
    return;
  }

  res.status(204).end();
});
