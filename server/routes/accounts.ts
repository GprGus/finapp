import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { accounts } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { createAccountSchema } from '../validation.js';

export const accountsRouter = Router();
accountsRouter.use(requireAuth);

accountsRouter.post('/', async (req, res) => {
  const parsed = createAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [account] = await db
    .insert(accounts)
    .values({ ...parsed.data, userId: req.userId! })
    .returning();

  res.status(201).json(account);
});

accountsRouter.patch('/:id', async (req, res) => {
  const parsed = createAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [account] = await db
    .update(accounts)
    .set(parsed.data)
    .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, req.userId!)))
    .returning();

  if (!account) {
    res.status(404).json({ error: 'Conta não encontrada' });
    return;
  }

  res.json(account);
});

accountsRouter.delete('/:id', async (req, res) => {
  const [deleted] = await db
    .delete(accounts)
    .where(and(eq(accounts.id, req.params.id), eq(accounts.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Conta não encontrada' });
    return;
  }

  res.status(204).end();
});
