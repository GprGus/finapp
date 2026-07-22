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
