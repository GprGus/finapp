import { useMemo, useState } from 'react';
import { useAgenda } from '../state/store';
import { useFriends } from '@/state/friends';
import { ApiError } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDeleteSheet } from '@/components/ConfirmDeleteSheet';
import { primaryButtonStyle } from '@/components/Sheet';
import { AddEventSheet } from '../components/AddEventSheet';
import { WEEKDAY_LABELS, addMonths, dateISO, daysInMonth, dayLabel, firstWeekdayOfMonth, monthLabel, todayISO } from '../lib/dates';
import type { AgendaEvent } from '../types';

function ChevronButton({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Mês anterior' : 'Próximo mês'}
      className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer bg-ink/6 flex-shrink-0"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d={direction === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
          stroke="var(--color-ink)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function Calendar() {
  const { events, incomingShares, deleteEvent, acceptShare, declineShare } = useAgenda();
  const { friends } = useFriends();
  const today = todayISO();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [editing, setEditing] = useState<AgendaEvent | null>(null);
  const [target, setTarget] = useState<AgendaEvent | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [shareBusyId, setShareBusyId] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'));
    return map;
  }, [events]);

  const friendName = (userId: string) => friends.find((f) => f.id === userId)?.name.trim() || 'um amigo';

  const cells: (number | null)[] = [
    ...Array(firstWeekdayOfMonth(year, month)).fill(null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
  ];

  const changeMonth = (delta: number) => {
    const next = addMonths(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  };

  const selectedEvents = eventsByDate.get(selectedDate) ?? [];

  const respondToShare = async (shareId: string, accept: boolean) => {
    setShareBusyId(shareId);
    setShareError(null);
    try {
      if (accept) await acceptShare(shareId);
      else await declineShare(shareId);
    } catch (err) {
      setShareError(err instanceof ApiError ? err.message : 'Erro ao processar convite');
    } finally {
      setShareBusyId(null);
    }
  };

  return (
    <div className="px-5 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+110px)]">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Agenda</div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">Seus compromissos, mês a mês</div>

      {incomingShares.length > 0 && (
        <div className="flex flex-col gap-2 mb-5">
          <div className="text-[13px] font-semibold text-ink/60">Convites de eventos</div>
          {shareError && (
            <div className="text-[13px]" style={{ color: 'var(--warning-color)' }}>
              {shareError}
            </div>
          )}
          {incomingShares.map((s) => (
            <div
              key={s.id}
              className="border border-ink/8 rounded-[16px] px-4 py-3"
              style={{ background: 'var(--color-card)' }}
            >
              <div className="text-[14px] font-semibold text-ink">{s.event.title}</div>
              <div className="text-[12px] text-ink/50 mt-0.5">
                {dayLabel(s.event.date)}
                {s.event.time && ` · ${s.event.time}`} · de {s.from.name.trim() || s.from.email}
              </div>
              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={() => respondToShare(s.id, true)}
                  disabled={shareBusyId === s.id}
                  className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold cursor-pointer border-none disabled:cursor-not-allowed"
                  style={primaryButtonStyle(true)}
                >
                  {shareBusyId === s.id ? '…' : 'Aceitar'}
                </button>
                <button
                  onClick={() => respondToShare(s.id, false)}
                  disabled={shareBusyId === s.id}
                  className="px-3 py-1.5 rounded-lg text-[12.5px] font-bold cursor-pointer border-none disabled:cursor-not-allowed"
                  style={{ background: 'var(--btn-danger-bg)', color: 'var(--btn-danger-fg)' }}
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <ChevronButton direction="left" onClick={() => changeMonth(-1)} />
        <div className="text-[15.5px] font-bold text-ink">{monthLabel(year, month)}</div>
        <ChevronButton direction="right" onClick={() => changeMonth(1)} />
      </div>

      <div className="grid grid-cols-7 gap-y-1 mb-1">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="text-center text-[11px] font-semibold text-ink/40 pb-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 mb-5">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} />;
          const iso = dateISO(year, month, day);
          const isToday = iso === today;
          const isSelected = iso === selectedDate;
          const count = eventsByDate.get(iso)?.length ?? 0;
          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(iso)}
              className="aspect-square flex flex-col items-center justify-center gap-0.5 rounded-xl cursor-pointer border-none mx-auto w-full"
              style={{
                background: isSelected ? 'var(--color-accent)' : 'transparent',
                color: isSelected ? '#fff' : isToday ? 'var(--color-accent)' : 'var(--color-ink)',
                fontWeight: isToday || isSelected ? 700 : 500,
              }}
            >
              <span className="text-[13px]">{day}</span>
              {count > 0 && (
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: isSelected ? '#fff' : 'var(--color-accent)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="text-[13px] font-semibold text-ink/60 mb-2">{dayLabel(selectedDate)}</div>

      {selectedEvents.length === 0 && (
        <EmptyState title="Nenhum compromisso" subtitle="Toque no botão + para agendar algo neste dia" />
      )}

      <div className="flex flex-col gap-2.5">
        {selectedEvents.map((event) => (
          <button
            key={event.id}
            onClick={() => setEditing(event)}
            className="text-left flex flex-col gap-1 border border-ink/8 rounded-[16px] px-4 py-3 cursor-pointer"
            style={{ background: 'var(--color-card)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-[14px] font-semibold text-ink">{event.title}</div>
              {event.time && <div className="text-[12.5px] text-ink/50 flex-shrink-0">{event.time}</div>}
            </div>
            {event.notes && <div className="text-[12.5px] text-ink/50 line-clamp-2">{event.notes}</div>}
            {event.sharedFromUserId && (
              <div className="text-[11px] text-ink/35">Compartilhado por {friendName(event.sharedFromUserId)}</div>
            )}
          </button>
        ))}
      </div>

      <AddEventSheet
        open={showAdd || !!editing}
        editing={editing}
        defaultDate={selectedDate}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        onRequestDelete={(event) => {
          setEditing(null);
          setTarget(event);
        }}
      />

      <ConfirmDeleteSheet
        open={!!target}
        title={`Excluir "${target?.title}"?`}
        onConfirm={async () => {
          if (target) await deleteEvent(target.id);
        }}
        onClose={() => setTarget(null)}
      />

      <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-70">
        <div className="relative w-full max-w-[560px] pointer-events-none">
          <button
            onClick={() => setShowAdd(true)}
            aria-label="Novo evento"
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
