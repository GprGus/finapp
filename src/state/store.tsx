import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Account, AccountType, Entry, FinanceState, Goal, Subscription, CategoryId } from '../types';
import { apiFetch } from '../lib/api';

const EMPTY_STATE: FinanceState = {
  accounts: [],
  goals: [],
  subscriptions: [],
  entries: [],
};

interface FinanceContextValue {
  state: FinanceState;
  isLoading: boolean;
  error: string | null;
  addAccount: (input: { name: string; type: AccountType; openingBalance: number }) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addGoal: (input: { name: string; target: number; current: number }) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addSubscription: (input: { name: string; price: number; renewDate: string; hue: number }) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  addEntry: (input: { date: string; desc: string; amount: number; categoryId: CategoryId; accountId: string }) => Promise<void>;
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
      const delta = state.entries
        .filter((e) => e.accountId === accountId)
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
      deleteAccount: async (id) => {
        await apiFetch(`/accounts/${id}`, { method: 'DELETE' });
        setState((s) => ({
          ...s,
          accounts: s.accounts.filter((a) => a.id !== id),
          entries: s.entries.filter((e) => e.accountId !== id),
        }));
      },

      addGoal: async (input) => {
        const goal = await apiFetch<Goal>('/goals', { method: 'POST', body: input });
        setState((s) => ({ ...s, goals: [...s.goals, goal] }));
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
        const sub = await apiFetch<Subscription>('/subscriptions', { method: 'POST', body: input });
        setState((s) => ({ ...s, subscriptions: [...s.subscriptions, sub] }));
      },
      deleteSubscription: async (id) => {
        await apiFetch(`/subscriptions/${id}`, { method: 'DELETE' });
        setState((s) => ({ ...s, subscriptions: s.subscriptions.filter((sub) => sub.id !== id) }));
      },

      addEntry: async (input) => {
        const entry = await apiFetch<Entry>('/entries', { method: 'POST', body: input });
        setState((s) => ({ ...s, entries: [entry, ...s.entries] }));
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
