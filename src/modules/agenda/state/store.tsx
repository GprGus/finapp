import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import type { AgendaEvent, AgendaEventShare } from '../types';

interface EventInput {
  title: string;
  notes: string | null;
  date: string;
  time: string | null;
}

interface AgendaContextValue {
  events: AgendaEvent[];
  incomingShares: AgendaEventShare[];
  isLoading: boolean;
  error: string | null;
  addEvent: (input: EventInput & { shareWithFriendIds?: string[] }) => Promise<void>;
  updateEvent: (id: string, input: EventInput) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  shareEvent: (id: string, friendIds: string[]) => Promise<void>;
  acceptShare: (shareId: string) => Promise<void>;
  declineShare: (shareId: string) => Promise<void>;
}

const AgendaContext = createContext<AgendaContextValue | null>(null);

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [incomingShares, setIncomingShares] = useState<AgendaEventShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiFetch<{ events: AgendaEvent[] }>('/agenda'), apiFetch<AgendaEventShare[]>('/agenda/shares')])
      .then(([{ events: fetchedEvents }, shares]) => {
        setEvents(fetchedEvents);
        setIncomingShares(shares);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar agenda'))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AgendaContextValue>(
    () => ({
      events,
      incomingShares,
      isLoading,
      error,
      addEvent: async (input) => {
        const { event } = await apiFetch<{ event: AgendaEvent }>('/agenda', { method: 'POST', body: input });
        setEvents((prev) => [event, ...prev]);
      },
      updateEvent: async (id, input) => {
        const event = await apiFetch<AgendaEvent>(`/agenda/${id}`, { method: 'PATCH', body: input });
        setEvents((prev) => prev.map((e) => (e.id === id ? event : e)));
      },
      deleteEvent: async (id) => {
        await apiFetch(`/agenda/${id}`, { method: 'DELETE' });
        setEvents((prev) => prev.filter((e) => e.id !== id));
      },
      shareEvent: async (id, friendIds) => {
        await apiFetch(`/agenda/${id}/share`, { method: 'POST', body: { friendIds } });
      },
      acceptShare: async (shareId) => {
        const { event } = await apiFetch<{ event: AgendaEvent }>(`/agenda/shares/${shareId}/accept`, { method: 'POST' });
        setEvents((prev) => [event, ...prev]);
        setIncomingShares((prev) => prev.filter((s) => s.id !== shareId));
      },
      declineShare: async (shareId) => {
        await apiFetch(`/agenda/shares/${shareId}`, { method: 'DELETE' });
        setIncomingShares((prev) => prev.filter((s) => s.id !== shareId));
      },
    }),
    [events, incomingShares, isLoading, error],
  );

  return <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>;
}

export function useAgenda(): AgendaContextValue {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda must be used within AgendaProvider');
  return ctx;
}
