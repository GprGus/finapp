import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { accounts, entries, subscriptions } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { createSubscriptionSchema } from '../validation.js';
import { addDays, todayISO } from '../lib/dates.js';

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

  const [subscription] = await db
    .insert(subscriptions)
    .values({ ...data, userId: req.userId! })
    .returning();

  if (!chargeNow) {
    res.status(201).json(subscription);
    return;
  }

  const today = todayISO();
  await db.insert(entries).values({
    userId: req.userId!,
    accountId: subscription.accountId,
    subscriptionId: subscription.id,
    date: today,
    desc: subscription.name,
    amount: -subscription.price,
    categoryId: 'assinaturas',
    retro: false,
  });

  const [updated] = await db
    .update(subscriptions)
    .set({ lastChargeDate: today, nextChargeDate: addDays(today, subscription.intervalDays) })
    .where(eq(subscriptions.id, subscription.id))
    .returning();

  res.status(201).json(updated);
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
