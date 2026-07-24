export function fmtBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export function fmtSigned(n: number): string {
  return (n >= 0 ? '+ ' : '- ') + fmtBRL(Math.abs(n));
}

export function todayISO(): string {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dateLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return 'Hoje';
  const d = new Date(iso + 'T00:00:00');
  const label = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function monthLabel(date = new Date()): string {
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function daysUntil(iso: string): number {
  const today = new Date(todayISO() + 'T00:00:00');
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Advances one calendar month from `iso`, landing on `billingDay` — clamped to the last day of
// the target month when that month is too short. Mirrors server/lib/dates.ts's version.
export function nextMonthlyChargeDate(iso: string, billingDay: number): string {
  const d = new Date(iso + 'T00:00:00');
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.min(billingDay, lastDayOfTargetMonth);
  const result = new Date(year, month, day);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}`;
}

// Shared by subscription/debt charge projections: advances from `current` according to whichever
// cadence mode the record uses. Keep in sync with server/lib/dates.ts's nextChargeDateFor.
export function nextChargeDateFor(
  current: string,
  entity: { cadence: string; intervalDays: number; billingDay: number | null },
): string {
  if (entity.cadence === 'monthly' && entity.billingDay) {
    return nextMonthlyChargeDate(current, entity.billingDay);
  }
  return addDays(current, entity.intervalDays);
}
