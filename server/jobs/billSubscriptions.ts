import { eq, lte } from 'drizzle-orm';
import { db } from '../db/client.js';
import { entries, subscriptions } from '../db/schema.js';
import { addDays, todayISO } from '../lib/dates.js';

// Bounds catch-up when the server was offline for a long stretch or intervalDays is small.
const MAX_CHARGES_PER_SUBSCRIPTION_PER_RUN = 24;

export async function billDueSubscriptions(): Promise<void> {
  const today = todayISO();
  const due = await db.query.subscriptions.findMany({
    where: lte(subscriptions.nextChargeDate, today),
  });

  for (const subscription of due) {
    let nextChargeDate = subscription.nextChargeDate;
    let lastChargeDate = subscription.lastChargeDate;
    let charges = 0;

    while (
      nextChargeDate <= today &&
      (subscription.isRecurring || !subscription.endDate || nextChargeDate <= subscription.endDate) &&
      charges < MAX_CHARGES_PER_SUBSCRIPTION_PER_RUN
    ) {
      await db.insert(entries).values({
        userId: subscription.userId,
        accountId: subscription.accountId,
        subscriptionId: subscription.id,
        date: nextChargeDate,
        desc: subscription.name,
        amount: -subscription.price,
        categoryId: 'assinaturas',
        retro: false,
      });

      lastChargeDate = nextChargeDate;
      nextChargeDate = addDays(nextChargeDate, subscription.intervalDays);
      charges++;
    }

    if (charges > 0) {
      await db
        .update(subscriptions)
        .set({ lastChargeDate, nextChargeDate })
        .where(eq(subscriptions.id, subscription.id));
    }
  }
}
