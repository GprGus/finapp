import { useEffect, useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass, primaryButtonStyle, chipStyle, dangerTextButtonStyle } from '@/components/Sheet';
import { ApiError } from '@/lib/api';
import { useFriends } from '@/state/friends';
import { useAgenda } from '../state/store';
import type { AgendaEvent } from '../types';

export function AddEventSheet({
  open,
  editing,
  defaultDate,
  onClose,
  onRequestDelete,
}: {
  open: boolean;
  editing?: AgendaEvent | null;
  defaultDate: string;
  onClose: () => void;
  onRequestDelete?: (event: AgendaEvent) => void;
}) {
  const { addEvent, updateEvent, shareEvent } = useAgenda();
  const { friends } = useFriends();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [shareIds, setShareIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setShareIds([]);
    if (editing) {
      setTitle(editing.title);
      setDate(editing.date);
      setTime(editing.time ?? '');
      setNotes(editing.notes ?? '');
    } else {
      setTitle('');
      setDate(defaultDate);
      setTime('');
      setNotes('');
    }
  }, [open, editing, defaultDate]);

  const canSubmit = title.trim().length > 0 && date.length > 0 && !isSubmitting;
  // An event cloned from a friend's share invite — re-sharing someone else's event isn't supported.
  const isSharedCopy = !!editing?.sharedFromUserId;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const data = { title: title.trim(), date, time: time || null, notes: notes.trim() || null };
      if (editing) {
        await updateEvent(editing.id, data);
        if (shareIds.length) await shareEvent(editing.id, shareIds);
      } else {
        await addEvent({ ...data, shareWithFriendIds: shareIds.length ? shareIds : undefined });
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>{editing ? 'Editar evento' : 'Novo evento'}</SheetTitle>

      <Field label="Título">
        <input
          className={inputClass}
          placeholder="Ex: Reunião com o time"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Data">
            <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Horário (opcional)">
            <input className={inputClass} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
      </div>

      <Field label="Observações">
        <textarea
          className={`${inputClass} min-h-[70px]`}
          placeholder="Detalhes, endereço, links…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      {!isSharedCopy && friends.length > 0 && (
        <Field label="Compartilhar com amigos">
          <div className="flex flex-wrap gap-2">
            {friends.map((f) => {
              const selected = shareIds.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => setShareIds((prev) => (selected ? prev.filter((id) => id !== f.id) : [...prev, f.id]))}
                  className="px-3 py-2 rounded-[10px] text-[13px] font-semibold border cursor-pointer"
                  style={chipStyle(selected)}
                >
                  {f.name.trim() || f.email}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      {error && (
        <div className="text-[13px] mb-3.5" style={{ color: 'var(--warning-color)' }}>
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="w-full py-[15px] rounded-2xl text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed mb-2.5"
        style={primaryButtonStyle(canSubmit)}
      >
        {isSubmitting ? 'Salvando…' : editing ? 'Salvar alterações' : 'Adicionar'}
      </button>

      {editing && onRequestDelete && (
        <button
          onClick={() => onRequestDelete(editing)}
          className="w-full py-3 rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent"
          style={dangerTextButtonStyle}
        >
          Excluir evento
        </button>
      )}
    </Sheet>
  );
}
