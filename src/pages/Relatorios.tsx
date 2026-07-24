import { useMemo, useState } from 'react';
import { useFinance } from '../state/store';
import { fmtBRL, fmtSigned, monthLabel } from '../lib/format';
import { EXPENSE_CATEGORIES, categoryBarColor } from '../lib/categories';
import { EmptyState } from '../components/EmptyState';
import { chipStyle } from '../components/Sheet';

type ReportView = 'despesas' | 'receitas' | 'misto';

const TABS: { id: ReportView; label: string }[] = [
  { id: 'despesas', label: 'Despesas' },
  { id: 'receitas', label: 'Receitas' },
  { id: 'misto', label: 'Misto' },
];

export function Relatorios() {
  const { state } = useFinance();
  const [view, setView] = useState<ReportView>('misto');

  const monthEntries = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return state.entries.filter((e) => e.date.startsWith(prefix));
  }, [state.entries]);

  const data = useMemo(() => {
    const expenses = monthEntries.filter((e) => e.amount < 0);
    const incomes = monthEntries.filter((e) => e.amount > 0);

    const totalSpent = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const totalIncome = incomes.reduce((sum, e) => sum + e.amount, 0);

    const reportCats = EXPENSE_CATEGORIES.map((c) => {
      const val = expenses.filter((e) => e.categoryId === c.id).reduce((s, e) => s + Math.abs(e.amount), 0);
      return { name: c.name, hue: c.hue, val, pct: totalSpent > 0 ? Math.round((val / totalSpent) * 100) : 0 };
    }).filter((c) => c.val > 0);

    const incomeMap = new Map<string, number>();
    incomes.forEach((e) => incomeMap.set(e.desc, (incomeMap.get(e.desc) ?? 0) + e.amount));
    const incomeReport = [...incomeMap.entries()]
      .map(([name, val]) => ({ name, val, pct: totalIncome > 0 ? Math.round((val / totalIncome) * 100) : 0 }))
      .sort((a, b) => b.val - a.val);

    const mixedItems = [
      ...reportCats.map((c) => ({ name: c.name, val: c.val, type: 'despesa' as const, color: categoryBarColor(c.hue) })),
      ...incomeReport.map((i) => ({ name: i.name, val: i.val, type: 'receita' as const, color: 'var(--positive-color)' })),
    ]
      .sort((a, b) => b.val - a.val)
      .slice(0, 6);
    const mixedMax = mixedItems.reduce((m, x) => Math.max(m, x.val), 1);
    const mixedReport = mixedItems.map((x) => ({
      ...x,
      pct: Math.round((x.val / mixedMax) * 100),
    }));

    const saldo = totalIncome - totalSpent;

    return { totalSpent, totalIncome, reportCats, incomeReport, mixedReport, saldo };
  }, [monthEntries]);

  return (
    <div className="px-5 pt-5 pb-10">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Relatórios</div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">{monthLabel()}</div>

      <div className="flex gap-1.5 bg-ink/6 rounded-[14px] p-1 mb-5">
        {TABS.map((t) => {
          const active = view === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className="flex-1 py-2.5 px-1.5 border-none rounded-[11px] text-[12.5px] font-bold cursor-pointer"
              style={chipStyle(active, undefined, t.id === 'receitas')}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {monthEntries.length === 0 && (
        <EmptyState
          title="Nenhum dado neste mês"
          subtitle="Adicione lançamentos para ver seus relatórios"
        />
      )}

      {view === 'despesas' && monthEntries.length > 0 && (
        <>
          <div
            className="rounded-[24px] px-5 py-[22px] mb-[22px] border"
            style={{ background: 'var(--hero-card-bg)', borderColor: 'var(--hero-card-border)' }}
          >
            <div className="text-[12.5px] mb-1.5" style={{ color: 'var(--hero-label-color)' }}>
              Total gasto no mês
            </div>
            <div className="text-[30px] font-bold text-white tracking-tight tabular-nums">
              {fmtBRL(data.totalSpent)}
            </div>
          </div>
          <div className="text-[15px] font-bold text-ink mb-3.5">Por categoria</div>
          {data.reportCats.length === 0 ? (
            <EmptyState title="Sem despesas no mês" subtitle="Adicione uma despesa para ver o detalhamento" />
          ) : (
            <div className="flex flex-col gap-4">
              {data.reportCats.map((c) => (
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
        </>
      )}

      {view === 'receitas' && monthEntries.length > 0 && (
        <>
          <div
            className="rounded-[24px] px-5 py-[22px] mb-[22px] border"
            style={{ background: 'var(--income-hero-bg)', borderColor: 'var(--income-hero-border)' }}
          >
            <div className="text-[12.5px] mb-1.5" style={{ color: 'var(--income-hero-label)' }}>
              Total recebido no mês
            </div>
            <div className="text-[30px] font-bold text-white tracking-tight tabular-nums">
              {fmtBRL(data.totalIncome)}
            </div>
          </div>
          <div className="text-[15px] font-bold text-ink mb-3.5">Por origem</div>
          {data.incomeReport.length === 0 ? (
            <EmptyState title="Sem receitas no mês" subtitle="Adicione uma receita para ver o detalhamento" />
          ) : (
            <div className="flex flex-col gap-4">
              {data.incomeReport.map((inc) => (
                <div key={inc.name}>
                  <div className="flex justify-between mb-1.5">
                    <div className="text-[13.5px] font-semibold text-ink">{inc.name}</div>
                    <div className="text-[13px] text-ink/50 tabular-nums">
                      {fmtBRL(inc.val)} · {inc.pct}%
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-ink/8 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${inc.pct}%`, background: 'var(--positive-color)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'misto' && monthEntries.length > 0 && (
        <>
          <div className="flex gap-2 mb-[22px]">
            <div
              className="flex-1 min-w-0 rounded-[18px] px-2.5 py-3.5 border"
              style={{ background: 'var(--income-box-bg)', borderColor: 'var(--income-box-border)' }}
            >
              <div className="text-[11px] mb-1" style={{ color: 'var(--income-box-label)' }}>
                Receitas
              </div>
              <div className="text-[15px] font-bold text-white tabular-nums truncate">{fmtBRL(data.totalIncome)}</div>
            </div>
            <div
              className="flex-1 min-w-0 rounded-[18px] px-2.5 py-3.5 border"
              style={{ background: 'var(--expense-box-bg)', borderColor: 'var(--expense-box-border)' }}
            >
              <div className="text-[11px] mb-1" style={{ color: 'var(--expense-box-label)' }}>
                Despesas
              </div>
              <div className="text-[15px] font-bold text-white tabular-nums truncate">{fmtBRL(data.totalSpent)}</div>
            </div>
            <div
              className="flex-1 min-w-0 border border-ink/10 rounded-[18px] px-2.5 py-3.5"
              style={{ background: 'var(--color-card)' }}
            >
              <div className="text-[11px] text-ink/50 mb-1">Saldo</div>
              <div
                className="text-[15px] font-bold tabular-nums truncate"
                style={{ color: data.saldo >= 0 ? 'var(--positive-color)' : 'var(--warning-color)' }}
              >
                {fmtSigned(data.saldo)}
              </div>
            </div>
          </div>
          <div className="text-[15px] font-bold text-ink mb-3.5">Maiores movimentações</div>
          {data.mixedReport.length === 0 ? (
            <EmptyState title="Nenhuma movimentação" subtitle="Adicione lançamentos para ver o resumo" />
          ) : (
            <div className="flex flex-col gap-4">
              {data.mixedReport.map((m) => (
                <div key={`${m.type}-${m.name}`}>
                  <div className="flex justify-between mb-1.5">
                    <div className="text-[13.5px] font-semibold text-ink">{m.name}</div>
                    <div
                      className="text-[13px] font-semibold tabular-nums"
                      style={{ color: m.type === 'receita' ? 'var(--positive-color)' : 'var(--color-ink)' }}
                    >
                      {(m.type === 'receita' ? '+ ' : '- ') + fmtBRL(m.val)}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-ink/8 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
