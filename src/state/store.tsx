import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Account, AccountType, Cadence, Debt, Entry, FinanceState, Goal, Subscription, CategoryId } from '../types';
import { apiFetch } from '../lib/api';
import { todayISO } from '../lib/format';

const EMPTY_STATE: FinanceState = {
  accounts: [],
  goals: [],
  subscriptions: [],
  debts: [],
  entries: [],
};

interface FinanceContextValue {
  state: FinanceState;
  isLoading: boolean;
  error: string | null;
  addAccount: (input: { name: string; type: AccountType; openingBalance: number }) => Promise<void>;
  updateAccount: (id: string, input: { name: string; type: AccountType; openingBalance: number }) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addGoal: (input: { name: string; target: number; current: number }) => Promise<void>;
  updateGoal: (id: string, input: { name: string; target: number; current: number }) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addSubscription: (input: {
    name: string;
    price: number;
    accountId: string;
    cadence: Cadence;
    intervalDays: number;
    nextChargeDate: string;
    isRecurring: boolean;
    endDate: string | null;
    hue: number;
    chargeNow: boolean;
  }) => Promise<void>;
  updateSubscription: (
    id: string,
    input: {
      name: string;
      price: number;
      accountId: string;
      cadence: Cadence;
      intervalDays: number;
      nextChargeDate: string;
      isRecurring: boolean;
      endDate: string | null;
      hue: number;
    },
  ) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  addDebt: (input: {
    name: string;
    accountId: string;
    installmentAmount: number;
    totalInstallments: number;
    cadence: Cadence;
    intervalDays: number;
    nextChargeDate: string;
    hue: number;
    chargeNow: boolean;
  }) => Promise<void>;
  updateDebt: (
    id: string,
    input: {
      name: string;
      accountId: string;
      installmentAmount: number;
      totalInstallments: number;
      paidInstallments: number;
      cadence: Cadence;
      intervalDays: number;
      nextChargeDate: string;
      hue: number;
    },
  ) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  abateDebt: (id: string, input: { amount: number; installmentsAbated: number }) => Promise<void>;
  addEntry: (input: { date: string; desc: string; amount: number; categoryId: CategoryId; accountId: string }) => Promise<void>;
  updateEntry: (
    id: string,
    input: { date: string; desc: string; amount: number; categoryId: CategoryId; accountId: string },
  ) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  accountBalance: (accountId: string) => number;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(EMPTY_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<FinanceState>('/state')
      .then(setState)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar dados'))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<FinanceContextValue>(() => {
    const accountBalance = (accountId: string) => {
      const acc = state.accounts.find((a) => a.id === accountId);
      if (!acc) return 0;
      const today = todayISO();
      const delta = state.entries
        .filter((e) => e.accountId === accountId && e.date <= today)
        .reduce((sum, e) => sum + e.amount, 0);
      return acc.openingBalance + delta;
    };

    return {
      state,
      isLoading,
      error,
      accountBalance,

      addAccount: async (input) => {
        const acc = await apiFetch<Account>('/accounts', { method: 'POST', body: input });
        setState((s) => ({ ...s, accounts: [...s.accounts, acc] }));
      },
      updateAccount: async (id, input) => {
        const acc = await apiFetch<Account>(`/accounts/${id}`, { method: 'PATCH', body: input });
        setState((s) => ({ ...s, accounts: s.accounts.map((a) => (a.id === id ? acc : a)) }));
      },
      deleteAccount: async (id) => {
        await apiFetch(`/accounts/${id}`, { method: 'DELETE' });
        setState((s) => ({
          ...s,
          accounts: s.accounts.filter((a) => a.id !== id),
          subscriptions: s.subscriptions.filter((sub) => sub.accountId !== id),
          debts: s.debts.filter((d) => d.accountId !== id),
          entries: s.entries.filter((e) => e.accountId !== id),
        }));
      },

      addGoal: async (input) => {
        const goal = await apiFetch<Goal>('/goals', { method: 'POST', body: input });
        setState((s) => ({ ...s, goals: [...s.goals, goal] }));
      },
      updateGoal: async (id, input) => {
        const goal = await apiFetch<Goal>(`/goals/${id}`, { method: 'PATCH', body: input });
        setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? goal : g)) }));
      },
      contributeToGoal: async (id, amount) => {
        const goal = await apiFetch<Goal>(`/goals/${id}/contribute`, { method: 'POST', body: { amount } });
        setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? goal : g)) }));
      },
      deleteGoal: async (id) => {
        await apiFetch(`/goals/${id}`, { method: 'DELETE' });
        setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
      },

      addSubscription: async (input) => {
        const { subscription, entries: created } = await apiFetch<{
          subscription: Subscription;
          entries: Entry[];
        }>('/subscriptions', { method: 'POST', body: input });
        setState((s) => ({
          ...s,
          subscriptions: [...s.subscriptions, subscription],
          entries: [...created, ...s.entries],
        }));
      },
      updateSubscription: async (id, input) => {
        const subscription = await apiFetch<Subscription>(`/subscriptions/${id}`, { method: 'PATCH', body: input });
        setState((s) => ({ ...s, subscriptions: s.subscriptions.map((sub) => (sub.id === id ? subscription : sub)) }));
      },
      deleteSubscription: async (id) => {
        await apiFetch(`/subscriptions/${id}`, { method: 'DELETE' });
        setState((s) => ({ ...s, subscriptions: s.subscriptions.filter((sub) => sub.id !== id) }));
      },

      addDebt: async (input) => {
        const { debt, entries: created } = await apiFetch<{ debt: Debt; entries: Entry[] }>('/debts', {
          method: 'POST',
          body: input,
        });
        setState((s) => ({
          ...s,
          debts: [...s.debts, debt],
          entries: [...created, ...s.entries],
        }));
      },
      updateDebt: async (id, input) => {
        const debt = await apiFetch<Debt>(`/debts/${id}`, { method: 'PATCH', body: input });
        setState((s) => ({ ...s, debts: s.debts.map((d) => (d.id === id ? debt : d)) }));
      },
      deleteDebt: async (id) => {
        await apiFetch(`/debts/${id}`, { method: 'DELETE' });
        setState((s) => ({ ...s, debts: s.debts.filter((d) => d.id !== id) }));
      },
      abateDebt: async (id, input) => {
        const { debt, entries: created } = await apiFetch<{ debt: Debt; entries: Entry[] }>(`/debts/${id}/abate`, {
          method: 'POST',
          body: input,
        });
        setState((s) => ({
          ...s,
          debts: s.debts.map((d) => (d.id === id ? debt : d)),
          entries: [...created, ...s.entries],
        }));
      },

      addEntry: async (input) => {
        const entry = await apiFetch<Entry>('/entries', { method: 'POST', body: input });
        setState((s) => ({ ...s, entries: [entry, ...s.entries] }));
      },
      updateEntry: async (id, input) => {
        const entry = await apiFetch<Entry>(`/entries/${id}`, { method: 'PATCH', body: input });
        setState((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? entry : e)) }));
      },
      deleteEntry: async (id) => {
        await apiFetch(`/entries/${id}`, { method: 'DELETE' });
        setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
      },
    };
  }, [state, isLoading, error]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
