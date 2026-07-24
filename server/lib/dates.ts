export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function dayOfMonth(iso: string): number {
  return Number(iso.slice(8, 10));
}

// Advances one calendar month from `iso`, landing on `billingDay` — clamped to the last day of
// the target month when that month is too short (e.g. billingDay 31 in April becomes April 30).
// This avoids the drift a plain `addDays(iso, 30)` causes across months of different lengths.
export function nextMonthlyChargeDate(iso: string, billingDay: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const lastDayOfTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(billingDay, lastDayOfTargetMonth);
  return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
}

// Shared by subscriptions and debts: advances from `current` to the next charge date according
// to whichever cadence mode the record uses.
export function nextChargeDateFor(
  current: string,
  entity: { cadence: string; intervalDays: number; billingDay: number | null },
): string {
  if (entity.cadence === 'monthly' && entity.billingDay) {
    return nextMonthlyChargeDate(current, entity.billingDay);
  }
  return addDays(current, entity.intervalDays);
}
