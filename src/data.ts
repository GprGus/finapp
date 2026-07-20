import type { Account, Category, Entry, Goal, Subscription } from './types';

export const TODAY = '2026-07-20';

export const CATS: Category[] = [
  { id: 'moradia', name: 'Moradia', hue: 40 },
  { id: 'alimentacao', name: 'Alimentação', hue: 140 },
  { id: 'transporte', name: 'Transporte', hue: 250 },
  { id: 'assinaturas', name: 'Assinaturas', hue: 300 },
  { id: 'lazer', name: 'Lazer', hue: 20 },
  { id: 'outros', name: 'Outros', hue: 90 },
  { id: 'renda', name: 'Renda', hue: 152 },
];

export function catById(id: string): Category {
  return CATS.find((c) => c.id === id) ?? CATS[CATS.length - 1];
}

export function fmtBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export function dotColor(hue: number): string {
  return `oklch(0.6 0.08 ${hue})`;
}

export function dateLabel(iso: string): string {
  if (iso === TODAY) return 'Hoje';
  const d = new Date(iso + 'T00:00:00');
  const label = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export const INITIAL_ENTRIES: Entry[] = [
  { id: 1, date: '2026-07-19', desc: 'Supermercado Extra', amount: -284.5, cat: 'alimentacao', account: 'Conta Corrente', retro: false },
  { id: 2, date: '2026-07-18', desc: 'Salário', amount: 6200.0, cat: 'renda', account: 'Conta Corrente', retro: false },
  { id: 3, date: '2026-07-15', desc: 'Aluguel', amount: -2100.0, cat: 'moradia', account: 'Conta Corrente', retro: false },
  { id: 4, date: '2026-07-14', desc: 'Uber', amount: -38.9, cat: 'transporte', account: 'Cartão de Crédito', retro: false },
  { id: 5, date: '2026-07-10', desc: 'Streaming Vídeo', amount: -39.9, cat: 'assinaturas', account: 'Cartão de Crédito', retro: false },
  { id: 6, date: '2026-07-08', desc: 'Cinema', amount: -64.0, cat: 'lazer', account: 'Cartão de Crédito', retro: false },
  { id: 7, date: '2026-06-30', desc: 'Farmácia', amount: -112.3, cat: 'outros', account: 'Conta Corrente', retro: true },
  { id: 8, date: '2026-07-05', desc: 'Conta de Luz', amount: -195.4, cat: 'moradia', account: 'Conta Corrente', retro: false },
  { id: 9, date: '2026-07-03', desc: 'Internet', amount: -99.9, cat: 'assinaturas', account: 'Conta Corrente', retro: false },
  { id: 10, date: '2026-07-01', desc: 'Freelance - Projeto X', amount: 1450.0, cat: 'renda', account: 'Conta Corrente', retro: false },
];

export const ACCOUNTS: Account[] = [
  { name: 'Conta Corrente', type: 'Corrente', balance: 8432.1 },
  { name: 'Cartão de Crédito', type: 'Cartão', balance: -1284.5 },
];

export const GOALS: Goal[] = [
  { name: 'Reserva de emergência', current: 12400, target: 20000 },
  { name: 'Viagem', current: 3200, target: 8000 },
];

export const SUBSCRIPTIONS: Subscription[] = [
  { name: 'Streaming Vídeo', price: 39.9, renew: '2026-07-24', hue: 300 },
  { name: 'Música', price: 21.9, renew: '2026-08-02', hue: 250 },
  { name: 'Armazenamento em Nuvem', price: 14.9, renew: '2026-08-15', hue: 90 },
  { name: 'Academia (app)', price: 59.9, renew: '2026-07-30', hue: 140 },
];
