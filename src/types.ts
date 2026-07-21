export type Tab = 'dashboard' | 'lancamentos' | 'assinaturas' | 'relatorios';

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
  name: string;
  price: number;
  renewDate: string;
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
  retro: boolean;
  createdAt: string;
}

export interface FinanceState {
  accounts: Account[];
  goals: Goal[];
  subscriptions: Subscription[];
  entries: Entry[];
}
