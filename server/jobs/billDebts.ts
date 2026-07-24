import { and, eq, lte, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { debts, entries } from '../db/schema.js';
import { nextChargeDateFor, todayISO } from '../lib/dates.js';

type DebtRow = typeof debts.$inferSelect;
type EntryRow = typeof entries.$inferSelect;

// Bounds catch-up when the server was offline for a long stretch or intervalDays is small.
const MAX_CHARGES_PER_DEBT_PER_RUN = 24;

// Charges every elapsed installment for one debt (nextChargeDate <= today), stopping once all
// installments are paid. Used both by the periodic job and right after creating a debt, so a
// backdated nextChargeDate charges immediately instead of waiting for the next scheduled run.
export async function chargeOverdueDebtCycles(
  debt: DebtRow,
): Promise<{ debt: DebtRow; entries: EntryRow[] }> {
  const today = todayISO();
  let nextChargeDate = debt.nextChargeDate;
  let lastChargeDate = debt.lastChargeDate;
  let paidInstallments = debt.paidInstallments;
  const createdEntries: EntryRow[] = [];

  while (
    nextChargeDate <= today &&
    paidInstallments < debt.totalInstallments &&
    createdEntries.length < MAX_CHARGES_PER_DEBT_PER_RUN
  ) {
    const [entry] = await db
      .insert(entries)
      .values({
        userId: debt.userId,
        accountId: debt.accountId,
        debtId: debt.id,
        date: nextChargeDate,
        desc: `${debt.name} (${paidInstallments + 1}/${debt.totalInstallments})`,
        amount: -debt.installmentAmount,
        categoryId: 'dividas',
        retro: false,
      })
      .returning();

    createdEntries.push(entry);
    lastChargeDate = nextChargeDate;
    nextChargeDate = nextChargeDateFor(nextChargeDate, debt);
    paidInstallments++;
  }

  if (createdEntries.length === 0) {
    return { debt, entries: createdEntries };
  }

  const [updated] = await db
    .update(debts)
    .set({ lastChargeDate, nextChargeDate, paidInstallments })
    .where(eq(debts.id, debt.id))
    .returning();

  return { debt: updated, entries: createdEntries };
}

export async function billDueDebts(): Promise<void> {
  const today = todayISO();
  const due = await db.query.debts.findMany({
    where: and(lte(debts.nextChargeDate, today), sql`${debts.paidInstallments} < ${debts.totalInstallments}`),
  });

  for (const debt of due) {
    await chargeOverdueDebtCycles(debt);
  }
}
