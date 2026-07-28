import { useMemo } from 'react';
import { useFinance } from '../state/store';
import { fmtSigned, dateLabel, todayISO } from '../lib/format';
import { getCategory, categoryDotColor } from '../lib/categories';
import { EmptyState } from '@/components/EmptyState';
import type { Entry } from '../types';

export function Lancamentos({ onSelectEntry }: { onSelectEntry: (entry: Entry) => void }) {
  const { state } = useFinance();

  const groups = useMemo(() => {
    const sorted = [...state.entries].sort((a, b) => b.date.localeCompare(a.date));
    const out: { date: string; label: string; items: Entry[] }[] = [];
    sorted.forEach((e) => {
      let g = out.find((g) => g.date === e.date);
      if (!g) {
        g = { date: e.date, label: dateLabel(e.date), items: [] };
        out.push(g);
      }
      g.items.push(e);
    });
    return out;
  }, [state.entries]);

  const accountName = (id: string) => state.accounts.find((a) => a.id === id)?.name ?? '—';

  return (
    <div className="px-5 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+110px)]">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Lançamentos</div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">
        Adicione ou edite lançamentos de qualquer data
      </div>

      {groups.length === 0 && (
        <EmptyState
          title="Nenhum lançamento ainda"
          subtitle="Toque no botão + para adicionar seu primeiro lançamento"
        />
      )}

      {groups.map((grp) => (
        <div key={grp.date} className="mb-[18px]">
          <div className="text-xs font-bold text-ink/45 uppercase tracking-wide mb-2">
            {grp.label}
          </div>
          <div className="border border-ink/8 rounded-[18px] overflow-hidden" style={{ background: 'var(--color-card)' }}>
            {grp.items.map((item, i) => {
              const cat = getCategory(item.categoryId);
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectEntry(item)}
                  className="w-full text-left flex items-center gap-3 px-4 py-[13px] relative cursor-pointer bg-transparent border-none"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: categoryDotColor(cat.hue) }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="text-[14.5px] text-ink font-medium truncate">
                        {item.desc}
                      </div>
                      {item.retro && (
                        <div
                          className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                          style={{ color: 'var(--badge-retro-fg)', background: 'var(--badge-retro-bg)' }}
                        >
                          RETROATIVO
                        </div>
                      )}
                      {item.date > todayISO() && (
                        <div
                          className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                          style={{ color: 'var(--badge-future-fg)', background: 'var(--badge-future-bg)' }}
                        >
                          FUTURO
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-ink/45">
                      {cat.name} · {accountName(item.accountId)}
                    </div>
                  </div>
                  <div
                    className="text-[14.5px] font-semibold tabular-nums"
                    style={{ color: item.amount >= 0 ? 'var(--positive-color)' : 'var(--color-ink)' }}
                  >
                    {fmtSigned(item.amount)}
                  </div>
                  {i < grp.items.length - 1 && (
                    <div className="absolute bottom-0 left-[52px] right-4 h-px bg-ink/8" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
