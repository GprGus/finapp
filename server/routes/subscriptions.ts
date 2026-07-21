import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { subscriptions } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { createSubscriptionSchema } from '../validation.js';

export const subscriptionsRouter = Router();
subscriptionsRouter.use(requireAuth);

subscriptionsRouter.post('/', async (req, res) => {
  const parsed = createSubscriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [subscription] = await db
    .insert(subscriptions)
    .values({ ...parsed.data, userId: req.userId! })
    .returning();

  res.status(201).json(subscription);
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
