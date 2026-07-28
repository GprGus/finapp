import { useMemo, useState } from 'react';
import { useFinance } from '../state/store';
import { fmtBRL, nextChargeDateFor, dateLabel, monthLabel } from '../lib/format';
import { EXPENSE_CATEGORIES, categoryBarColor, getCategory } from '../lib/categories';
import { EmptyState } from '@/components/EmptyState';
import type { CategoryId, Debt, Subscription } from '../types';

const FORECAST_MONTHS = 24;

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
// server's chargeOverdueCycles cutoff rule (recurring, or not yet past its end date). The guard
// caps iterations well above what a 2-year horizon with a 1-day interval could ever need (~730).
function projectSubscriptionCharges(sub: Subscription, start: string, end: string): ForecastItem[] {
  const items: ForecastItem[] = [];
  let cursor = sub.nextChargeDate;
  let guard = 0;

  while (cursor <= end && guard < 800) {
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
    cursor = nextChargeDateFor(cursor, sub);
    guard++;
  }

  return items;
}

// Same idea for debts, but the cutoff is the installment count instead of a recurring/end-date rule.
function projectDebtCharges(debt: Debt, start: string, end: string): ForecastItem[] {
  const items: ForecastItem[] = [];
  let cursor = debt.nextChargeDate;
  let installment = debt.paidInstallments;
  let guard = 0;

  while (cursor <= end && installment < debt.totalInstallments && guard < 800) {
    if (cursor >= start) {
      items.push({
        id: `${debt.id}-${cursor}`,
        date: cursor,
        desc: `${debt.name} (${installment + 1}/${debt.totalInstallments})`,
        amount: -debt.installmentAmount,
        categoryId: 'dividas',
        confirmed: false,
      });
    }
    cursor = nextChargeDateFor(cursor, debt);
    installment++;
    guard++;
  }

  return items;
}

function MonthRow({
  range,
  items,
  expanded,
  onToggle,
}: {
  range: { start: string; end: string; label: string };
  items: ForecastItem[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const total = items.reduce((sum, i) => sum + Math.abs(i.amount), 0);

  const byCategory = EXPENSE_CATEGORIES.map((c) => {
    const val = items.filter((i) => i.categoryId === c.id).reduce((s, i) => s + Math.abs(i.amount), 0);
    return { name: c.name, hue: c.hue, val, pct: total > 0 ? Math.round((val / total) * 100) : 0 };
  }).filter((c) => c.val > 0);

  return (
    <div className="mb-3">
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between border border-ink/8 rounded-[16px] px-4 py-3.5 cursor-pointer"
        style={{ background: 'var(--color-card)' }}
      >
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold text-ink capitalize truncate">{range.label}</div>
          <div className="text-[12px] text-ink/45">
            {items.length === 0 ? 'Sem gastos previstos' : `${items.length} lançamento(s)`}
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="text-[15px] font-bold text-ink tabular-nums">{fmtBRL(total)}</div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="rgba(var(--ink-rgb), 0.4)"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="mt-3">
          {items.length === 0 ? (
            <EmptyState
              title="Nenhum gasto previsto"
              subtitle="Sem lançamentos futuros, assinaturas ou dívidas pendentes neste mês"
            />
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

              <div className="border border-ink/8 rounded-[18px] overflow-hidden" style={{ background: 'var(--color-card)' }}>
                {items.map((item, i) => {
                  const cat = getCategory(item.categoryId);
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-[13px] relative">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: categoryBarColor(cat.hue) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="text-[14.5px] text-ink font-medium truncate">{item.desc}</div>
                          <div
                            className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                            style={
                              item.confirmed
                                ? { color: 'var(--badge-future-fg)', background: 'var(--badge-future-bg)' }
                                : { color: 'rgba(var(--ink-rgb), 0.55)', background: 'rgba(var(--ink-rgb), 0.08)' }
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
                      {i < items.length - 1 && (
                        <div className="absolute bottom-0 left-[52px] right-4 h-px bg-ink/8" />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function GastosPrevistos() {
  const { state } = useFinance();
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0, 1]));

  const sections = useMemo(() => {
    return Array.from({ length: FORECAST_MONTHS }, (_, offset) => {
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

      const projectedSubs = state.subscriptions.flatMap((s) => projectSubscriptionCharges(s, range.start, range.end));
      const projectedDebts = state.debts.flatMap((d) => projectDebtCharges(d, range.start, range.end));

      const items = [...actual, ...projectedSubs, ...projectedDebts].sort((a, b) => a.date.localeCompare(b.date));
      return { range, items };
    });
  }, [state.entries, state.subscriptions, state.debts]);

  const toggle = (i: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="px-5 pt-5 pb-10">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Gastos previstos</div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">
        Projeção dos próximos 24 meses, incluindo assinaturas e dívidas ainda não cobradas e lançamentos futuros
      </div>

      {sections.map((section, i) => (
        <MonthRow
          key={section.range.start}
          range={section.range}
          items={section.items}
          expanded={expanded.has(i)}
          onToggle={() => toggle(i)}
        />
      ))}
    </div>
  );
}
