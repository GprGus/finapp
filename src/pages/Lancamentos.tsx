import { useMemo, useState } from 'react';
import { useFinance } from '../state/store';
import { fmtSigned, dateLabel } from '../lib/format';
import { getCategory, categoryDotColor } from '../lib/categories';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDeleteSheet } from '../components/ConfirmDeleteSheet';
import type { Entry } from '../types';

export function Lancamentos() {
  const { state, deleteEntry } = useFinance();
  const [target, setTarget] = useState<Entry | null>(null);

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
    <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+20px)] pb-[130px]">
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
          <div className="bg-white border border-ink/8 rounded-[18px] overflow-hidden">
            {grp.items.map((item, i) => {
              const cat = getCategory(item.categoryId);
              return (
                <button
                  key={item.id}
                  onClick={() => setTarget(item)}
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
                          style={{ color: 'oklch(0.5 0.15 35)', background: 'oklch(0.5 0.15 35 / 0.12)' }}
                        >
                          RETROATIVO
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-ink/45">
                      {cat.name} · {accountName(item.accountId)}
                    </div>
                  </div>
                  <div
                    className="text-[14.5px] font-semibold tabular-nums"
                    style={{ color: item.amount >= 0 ? 'oklch(0.42 0.13 152)' : '#14140F' }}
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

      <ConfirmDeleteSheet
        open={!!target}
        title={`Excluir "${target?.desc}"?`}
        onConfirm={async () => {
          if (target) await deleteEntry(target.id);
        }}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
