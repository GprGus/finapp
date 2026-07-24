import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { accounts, debts, entries } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { createDebtSchema, updateDebtSchema } from '../validation.js';
import { dayOfMonth, nextChargeDateFor, todayISO } from '../lib/dates.js';
import { chargeOverdueDebtCycles } from '../jobs/billDebts.js';

export const debtsRouter = Router();
debtsRouter.use(requireAuth);

debtsRouter.post('/', async (req, res) => {
  const parsed = createDebtSchema.safeParse(req.body);
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

  const [debt] = await db
    .insert(debts)
    .values({ ...data, billingDay, userId: req.userId! })
    .returning();

  let current = debt;
  const createdEntries = [];

  if (chargeNow) {
    const today = todayISO();
    const [entry] = await db
      .insert(entries)
      .values({
        userId: req.userId!,
        accountId: current.accountId,
        debtId: current.id,
        date: today,
        desc: `${current.name} (${current.paidInstallments + 1}/${current.totalInstallments})`,
        amount: -current.installmentAmount,
        categoryId: 'dividas',
        retro: false,
      })
      .returning();
    createdEntries.push(entry);

    const [updated] = await db
      .update(debts)
      .set({
        lastChargeDate: today,
        nextChargeDate: nextChargeDateFor(today, current),
        paidInstallments: current.paidInstallments + 1,
      })
      .where(eq(debts.id, current.id))
      .returning();
    current = updated;
  }

  // Catches up any installments still overdue (e.g. a backdated "primeira cobrança") instead of
  // waiting for the next hourly billing pass.
  const caughtUp = await chargeOverdueDebtCycles(current);
  current = caughtUp.debt;
  createdEntries.push(...caughtUp.entries);

  res.status(201).json({ debt: current, entries: createdEntries });
});

debtsRouter.patch('/:id', async (req, res) => {
  const parsed = updateDebtSchema.safeParse(req.body);
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

  const [debt] = await db
    .update(debts)
    .set({ ...parsed.data, billingDay })
    .where(and(eq(debts.id, req.params.id), eq(debts.userId, req.userId!)))
    .returning();

  if (!debt) {
    res.status(404).json({ error: 'Dívida não encontrada' });
    return;
  }

  res.json(debt);
});

debtsRouter.delete('/:id', async (req, res) => {
  const [deleted] = await db
    .delete(debts)
    .where(and(eq(debts.id, req.params.id), eq(debts.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Dívida não encontrada' });
    return;
  }

  res.status(204).end();
});
