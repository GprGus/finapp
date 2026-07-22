import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { accounts, entries } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { createEntrySchema } from '../validation.js';
import { todayISO } from '../lib/dates.js';

export const entriesRouter = Router();
entriesRouter.use(requireAuth);

entriesRouter.post('/', async (req, res) => {
  const parsed = createEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
  const { accountId } = parsed.data;

  const account = await db.query.accounts.findFirst({
    where: and(eq(accounts.id, accountId), eq(accounts.userId, req.userId!)),
  });
  if (!account) {
    res.status(404).json({ error: 'Conta não encontrada' });
    return;
  }

  const [entry] = await db
    .insert(entries)
    .values({ ...parsed.data, userId: req.userId!, retro: parsed.data.date < todayISO() })
    .returning();

  res.status(201).json(entry);
});

entriesRouter.delete('/:id', async (req, res) => {
  const [deleted] = await db
    .delete(entries)
    .where(and(eq(entries.id, req.params.id), eq(entries.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Lançamento não encontrado' });
    return;
  }

  res.status(204).end();
});
