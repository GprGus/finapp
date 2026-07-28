import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import type { Note } from '../types';

interface NotesContextValue {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  addNote: () => Promise<Note>;
  updateNote: (id: string, data: Partial<Pick<Note, 'title' | 'contentHtml'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Note[]>('/notes')
      .then(setNotes)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar notas'))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      isLoading,
      error,
      addNote: async () => {
        const note = await apiFetch<Note>('/notes', { method: 'POST' });
        setNotes((prev) => [note, ...prev]);
        return note;
      },
      updateNote: async (id, data) => {
        const note = await apiFetch<Note>(`/notes/${id}`, { method: 'PATCH', body: data });
        setNotes((prev) => prev.map((n) => (n.id === id ? note : n)));
      },
      deleteNote: async (id) => {
        await apiFetch(`/notes/${id}`, { method: 'DELETE' });
        setNotes((prev) => prev.filter((n) => n.id !== id));
      },
    }),
    [notes, isLoading, error],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
