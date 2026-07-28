export type Tab = 'dashboard' | 'lancamentos' | 'assinaturas' | 'dividas' | 'relatorios' | 'previstos';

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

export type Cadence = 'interval' | 'monthly';

export interface Subscription {
  id: string;
  accountId: string;
  name: string;
  price: number;
  cadence: Cadence;
  intervalDays: number;
  billingDay: number | null;
  nextChargeDate: string;
  lastChargeDate: string | null;
  isRecurring: boolean;
  endDate: string | null;
  hue: number;
  createdAt: string;
}

export interface Debt {
  id: string;
  accountId: string;
  name: string;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  cadence: Cadence;
  intervalDays: number;
  billingDay: number | null;
  nextChargeDate: string;
  lastChargeDate: string | null;
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
  | 'dividas'
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
  debtId: string | null;
  retro: boolean;
  createdAt: string;
}

export interface FinanceState {
  accounts: Account[];
  goals: Goal[];
  subscriptions: Subscription[];
  debts: Debt[];
  entries: Entry[];
}
