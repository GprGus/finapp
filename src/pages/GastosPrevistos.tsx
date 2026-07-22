import { useMemo } from 'react';
import { useFinance } from '../state/store';
import { fmtBRL, addDays, dateLabel, monthLabel } from '../lib/format';
import { EXPENSE_CATEGORIES, categoryBarColor, getCategory } from '../lib/categories';
import { EmptyState } from '../components/EmptyState';
import type { CategoryId, Subscription } from '../types';

interface ForecastItem {
  id: string;
  date: string;
  desc: string;
  amount: number;
  categoryId: CategoryId;
  confirmed: boolean;
}

function monthRange(offset: number) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: iso(first), end: iso(last), label: monthLabel(first) };
}

// Simulates a subscription's still-pending charges from nextChargeDate forward, mirroring the
// server's chargeOverdueCycles cutoff rule (recurring, or not yet past its end date).
function projectCharges(sub: Subscription, start: string, end: string): ForecastItem[] {
  const items: ForecastItem[] = [];
  let cursor = sub.nextChargeDate;
  let guard = 0;

  while (cursor <= end && guard < 60) {
    if (!sub.isRecurring && sub.endDate && cursor > sub.endDate) break;
    if (cursor >= start) {
      items.push({
        id: `${sub.id}-${cursor}`,
        date: cursor,
        desc: sub.name,
        amount: -sub.price,
        categoryId: 'assinaturas',
        confirmed: false,
      });
    }
    cursor = addDays(cursor, sub.intervalDays);
    guard++;
  }

  return items;
}

function MonthSection({
  range,
  items,
}: {
  range: { start: string; end: string; label: string };
  items: ForecastItem[];
}) {
  const total = items.reduce((sum, i) => sum + Math.abs(i.amount), 0);

  const byCategory = EXPENSE_CATEGORIES.map((c) => {
    const val = items.filter((i) => i.categoryId === c.id).reduce((s, i) => s + Math.abs(i.amount), 0);
    return { name: c.name, hue: c.hue, val, pct: total > 0 ? Math.round((val / total) * 100) : 0 };
  }).filter((c) => c.val > 0);

  return (
    <div className="mb-7">
      <div className="text-[15px] font-bold text-ink mb-3.5 capitalize">{range.label}</div>

      <div className="bg-ink rounded-[24px] px-5 py-[22px] mb-[18px]">
        <div className="text-[12.5px] text-white/55 mb-1.5">Gasto previsto</div>
        <div className="text-[28px] font-bold text-white tracking-tight tabular-nums">{fmtBRL(total)}</div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Nenhum gasto previsto" subtitle="Sem lançamentos futuros ou assinaturas pendentes neste mês" />
      ) : (
        <>
          {byCategory.length > 0 && (
            <div className="flex flex-col gap-4 mb-5">
              {byCategory.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between mb-1.5">
                    <div className="text-[13.5px] font-semibold text-ink">{c.name}</div>
                    <div className="text-[13px] text-ink/50 tabular-nums">
                      {fmtBRL(c.val)} · {c.pct}%
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-ink/8 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${c.pct}%`, background: categoryBarColor(c.hue) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white border border-ink/8 rounded-[18px] overflow-hidden">
            {items.map((item, i) => {
              const cat = getCategory(item.categoryId);
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-[13px] relative">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: categoryBarColor(cat.hue) }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div className="text-[14.5px] text-ink font-medium truncate">{item.desc}</div>
                      <div
                        className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={
                          item.confirmed
                            ? { color: 'oklch(0.5 0.15 250)', background: 'oklch(0.5 0.15 250 / 0.12)' }
                            : { color: 'rgba(20,20,15,0.55)', background: 'rgba(20,20,15,0.08)' }
                        }
                      >
                        {item.confirmed ? 'LANÇADO' : 'PREVISTO'}
                      </div>
                    </div>
                    <div className="text-xs text-ink/45">
                      {cat.name} · {dateLabel(item.date)}
                    </div>
                  </div>
                  <div className="text-[14.5px] font-semibold tabular-nums text-ink">
                    {'- ' + fmtBRL(Math.abs(item.amount))}
                  </div>
                  {i < items.length - 1 && <div className="absolute bottom-0 left-[52px] right-4 h-px bg-ink/8" />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function GastosPrevistos() {
  const { state } = useFinance();

  const sections = useMemo(() => {
    return [0, 1].map((offset) => {
      const range = monthRange(offset);

      const actual: ForecastItem[] = state.entries
        .filter((e) => e.amount < 0 && e.date >= range.start && e.date <= range.end)
        .map((e) => ({
          id: e.id,
          date: e.date,
          desc: e.desc,
          amount: e.amount,
          categoryId: e.categoryId,
          confirmed: true,
        }));

      const projected = state.subscriptions.flatMap((s) => projectCharges(s, range.start, range.end));

      const items = [...actual, ...projected].sort((a, b) => a.date.localeCompare(b.date));
      return { range, items };
    });
  }, [state.entries, state.subscriptions]);

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+20px)] pb-[130px]">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Gastos previstos</div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">
        Projeção do mês atual e do mês seguinte, incluindo assinaturas ainda não cobradas e lançamentos futuros
      </div>

      {sections.map(({ range, items }) => (
        <MonthSection key={range.start} range={range} items={items} />
      ))}
    </div>
  );
}
