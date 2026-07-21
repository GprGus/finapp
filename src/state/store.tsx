import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Account, AccountType, Entry, FinanceState, Goal, Subscription, CategoryId } from '../types';
import { uid, todayISO } from '../lib/format';

const STORAGE_KEY = 'app-financeiro:v1';

const EMPTY_STATE: FinanceState = {
  accounts: [],
  goals: [],
  subscriptions: [],
  entries: [],
};

function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return {
      accounts: parsed.accounts ?? [],
      goals: parsed.goals ?? [],
      subscriptions: parsed.subscriptions ?? [],
      entries: parsed.entries ?? [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

interface FinanceContextValue {
  state: FinanceState;
  addAccount: (input: { name: string; type: AccountType; openingBalance: number }) => void;
  deleteAccount: (id: string) => void;
  addGoal: (input: { name: string; target: number; current: number }) => void;
  contributeToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  addSubscription: (input: { name: string; price: number; renewDate: string; hue: number }) => void;
  deleteSubscription: (id: string) => void;
  addEntry: (input: { date: string; desc: string; amount: number; categoryId: CategoryId; accountId: string }) => void;
  deleteEntry: (id: string) => void;
  accountBalance: (accountId: string) => number;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
      accountBalance,

      addAccount: ({ name, type, openingBalance }) => {
        const acc: Account = { id: uid(), name, type, openingBalance, createdAt: todayISO() };
        setState((s) => ({ ...s, accounts: [...s.accounts, acc] }));
      },
      deleteAccount: (id) => {
        setState((s) => ({
          ...s,
          accounts: s.accounts.filter((a) => a.id !== id),
          entries: s.entries.filter((e) => e.accountId !== id),
        }));
      },

      addGoal: ({ name, target, current }) => {
        const goal: Goal = { id: uid(), name, target, current, createdAt: todayISO() };
        setState((s) => ({ ...s, goals: [...s.goals, goal] }));
      },
      contributeToGoal: (id, amount) => {
        setState((s) => ({
          ...s,
          goals: s.goals.map((g) => (g.id === id ? { ...g, current: g.current + amount } : g)),
        }));
      },
      deleteGoal: (id) => {
        setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
      },

      addSubscription: ({ name, price, renewDate, hue }) => {
        const sub: Subscription = { id: uid(), name, price, renewDate, hue, createdAt: todayISO() };
        setState((s) => ({ ...s, subscriptions: [...s.subscriptions, sub] }));
      },
      deleteSubscription: (id) => {
        setState((s) => ({ ...s, subscriptions: s.subscriptions.filter((sub) => sub.id !== id) }));
      },

      addEntry: ({ date, desc, amount, categoryId, accountId }) => {
        const entry: Entry = {
          id: uid(),
          date,
          desc,
          amount,
          categoryId,
          accountId,
          retro: date < todayISO(),
          createdAt: todayISO(),
        };
        setState((s) => ({ ...s, entries: [entry, ...s.entries] }));
      },
      deleteEntry: (id) => {
        setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
      },
    };
  }, [state]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}
