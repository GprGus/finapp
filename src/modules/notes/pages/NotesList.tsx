import { useMemo } from 'react';
import { useNotes } from '../state/store';
import { EmptyState } from '@/components/EmptyState';
import type { Note } from '../types';

function snippet(html: string): string {
  const text = html
    .replace(/<img[^>]*>/gi, '[imagem] ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text || 'Sem conteúdo';
}

function relativeDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(d);
}

export function NotesList({ onSelectNote, onNewNote }: { onSelectNote: (note: Note) => void; onNewNote: () => void }) {
  const { notes } = useNotes();

  const sorted = useMemo(() => [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [notes]);

  return (
    <div className="px-5 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+110px)]">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Notes</div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">
        {notes.length} nota{notes.length === 1 ? '' : 's'}
      </div>

      {notes.length === 0 && (
        <EmptyState title="Nenhuma nota ainda" subtitle="Toque no botão + para criar sua primeira nota" />
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((note) => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note)}
            className="text-left flex flex-col gap-1 border border-ink/8 rounded-[18px] px-4 py-3.5 cursor-pointer"
            style={{ background: 'var(--color-card)' }}
          >
            <div className="text-[14.5px] font-semibold text-ink">{note.title.trim() || 'Sem título'}</div>
            <div className="text-[12.5px] text-ink/50 line-clamp-2">{snippet(note.contentHtml)}</div>
            <div className="text-[11px] text-ink/35 mt-0.5">{relativeDate(note.updatedAt)}</div>
          </button>
        ))}
      </div>

      <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-70">
        <div className="relative w-full max-w-[560px] pointer-events-none">
          <button
            onClick={onNewNote}
            aria-label="Nova nota"
            className="absolute right-5 bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] w-14 h-14 rounded-[28px] flex items-center justify-center text-[28px] leading-none pointer-events-auto cursor-pointer"
            style={{
              boxShadow: 'var(--fab-shadow)',
              background: 'var(--fab-bg)',
              border: '1px solid var(--fab-border)',
              color: 'var(--fab-fg)',
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
