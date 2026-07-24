import { eq, lte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { entries, subscriptions } from '../db/schema.js';
import { nextChargeDateFor, todayISO } from '../lib/dates.js';

type SubscriptionRow = typeof subscriptions.$inferSelect;
type EntryRow = typeof entries.$inferSelect;

// Bounds catch-up when the server was offline for a long stretch or intervalDays is small.
const MAX_CHARGES_PER_SUBSCRIPTION_PER_RUN = 24;

// Charges every elapsed cycle for one subscription (nextChargeDate <= today), stopping if it
// has a non-recurring end date already in the past. Used both by the periodic job and right
// after creating a subscription, so a backdated nextChargeDate charges immediately instead of
// waiting for the next scheduled run.
export async function chargeOverdueCycles(
  subscription: SubscriptionRow,
): Promise<{ subscription: SubscriptionRow; entries: EntryRow[] }> {
  const today = todayISO();
  let nextChargeDate = subscription.nextChargeDate;
  let lastChargeDate = subscription.lastChargeDate;
  const createdEntries: EntryRow[] = [];

  while (
    nextChargeDate <= today &&
    (subscription.isRecurring || !subscription.endDate || nextChargeDate <= subscription.endDate) &&
    createdEntries.length < MAX_CHARGES_PER_SUBSCRIPTION_PER_RUN
  ) {
    const [entry] = await db
      .insert(entries)
      .values({
        userId: subscription.userId,
        accountId: subscription.accountId,
        subscriptionId: subscription.id,
        date: nextChargeDate,
        desc: subscription.name,
        amount: -subscription.price,
        categoryId: 'assinaturas',
        retro: false,
      })
      .returning();

    createdEntries.push(entry);
    lastChargeDate = nextChargeDate;
    nextChargeDate = nextChargeDateFor(nextChargeDate, subscription);
  }

  if (createdEntries.length === 0) {
    return { subscription, entries: createdEntries };
  }

  const [updated] = await db
    .update(subscriptions)
    .set({ lastChargeDate, nextChargeDate })
    .where(eq(subscriptions.id, subscription.id))
    .returning();

  return { subscription: updated, entries: createdEntries };
}

export async function billDueSubscriptions(): Promise<void> {
  const today = todayISO();
  const due = await db.query.subscriptions.findMany({
    where: lte(subscriptions.nextChargeDate, today),
  });

  for (const subscription of due) {
    await chargeOverdueCycles(subscription);
  }
}
