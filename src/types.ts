export type Tab = 'dashboard' | 'lancamentos' | 'assinaturas' | 'relatorios' | 'previstos';

export interface User {
  id: string;
  email: string;
  name: string;
}

export type AccountType = 'Corrente' | 'Poupança' | 'Cartão' | 'Investimento' | 'Dinheiro';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  accountId: string;
  name: string;
  price: number;
  intervalDays: number;
  nextChargeDate: string;
  lastChargeDate: string | null;
  isRecurring: boolean;
  endDate: string | null;
  hue: number;
  createdAt: string;
}

export type CategoryId =
  | 'moradia'
  | 'alimentacao'
  | 'transporte'
  | 'assinaturas'
  | 'lazer'
  | 'saude'
  | 'educacao'
  | 'outros'
  | 'renda';

export interface Category {
  id: CategoryId;
  name: string;
  hue: number;
}

export interface Entry {
  id: string;
  date: string;
  desc: string;
  amount: number;
  categoryId: CategoryId;
  accountId: string;
  subscriptionId: string | null;
  retro: boolean;
  createdAt: string;
}

export interface FinanceState {
  accounts: Account[];
  goals: Goal[];
  subscriptions: Subscription[];
  entries: Entry[];
}
