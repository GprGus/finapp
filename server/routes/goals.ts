import { Router } from 'express';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { goals } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { contributeToGoalSchema, createGoalSchema } from '../validation.js';

export const goalsRouter = Router();
goalsRouter.use(requireAuth);

goalsRouter.post('/', async (req, res) => {
  const parsed = createGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [goal] = await db
    .insert(goals)
    .values({ ...parsed.data, userId: req.userId! })
    .returning();

  res.status(201).json(goal);
});

goalsRouter.post('/:id/contribute', async (req, res) => {
  const parsed = contributeToGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [goal] = await db
    .update(goals)
    .set({ current: sql`${goals.current} + ${parsed.data.amount}` })
    .where(and(eq(goals.id, req.params.id), eq(goals.userId, req.userId!)))
    .returning();

  if (!goal) {
    res.status(404).json({ error: 'Meta não encontrada' });
    return;
  }

  res.json(goal);
});

goalsRouter.delete('/:id', async (req, res) => {
  const [deleted] = await db
    .delete(goals)
    .where(and(eq(goals.id, req.params.id), eq(goals.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Meta não encontrada' });
    return;
  }

  res.status(204).end();
});
