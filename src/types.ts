export type EntryType = 'despesa' | 'receita';
export type Tab = 'dashboard' | 'lancamentos' | 'assinaturas' | 'relatorios';
export type ReportView = 'despesas' | 'receitas' | 'misto';

export interface Category {
  id: string;
  name: string;
  hue: number;
}

export interface Entry {
  id: number;
  date: string;
  desc: string;
  amount: number;
  cat: string;
  account: string;
  retro: boolean;
}

export interface Account {
  name: string;
  type: string;
  balance: number;
}

export interface Goal {
  name: string;
  current: number;
  target: number;
}

export interface Subscription {
  name: string;
  price: number;
  renew: string;
  hue: number;
}

export interface EntryForm {
  date: string;
  desc: string;
  amount: string;
  type: EntryType;
  category: string;
  account: string;
}
