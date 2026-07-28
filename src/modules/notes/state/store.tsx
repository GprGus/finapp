import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Note } from '../types';

const STORAGE_KEY = 'notes.items';

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

interface NotesContextValue {
  notes: Note[];
  addNote: () => Note;
  updateNote: (id: string, data: Partial<Pick<Note, 'title' | 'contentHtml'>>) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(loadNotes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      addNote: () => {
        const now = new Date().toISOString();
        const note: Note = { id: crypto.randomUUID(), title: '', contentHtml: '', createdAt: now, updatedAt: now };
        setNotes((prev) => [note, ...prev]);
        return note;
      },
      updateNote: (id, data) => {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n)),
        );
      },
      deleteNote: (id) => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
      },
    }),
    [notes],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
