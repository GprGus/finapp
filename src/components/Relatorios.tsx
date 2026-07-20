import type { CSSProperties } from 'react';
import type { Entry, ReportView } from '../types';
import { CATS, fmtBRL } from '../data';

interface Props {
  entries: Entry[];
  reportView: ReportView;
  onSetReportView: (v: ReportView) => void;
}

export default function Relatorios({ entries, reportView, onSetReportView }: Props) {
  const spentCats = CATS.filter((c) => c.id !== 'renda').map((c) => {
    const val = -entries.filter((e) => e.cat === c.id && e.amount < 0).reduce((a, e) => a + e.amount, 0);
    return { c, val };
  });
  const totalSpent = spentCats.reduce((a, x) => a + x.val, 0) || 1;
  const reportCats = spentCats.map(({ c, val }) => {
    const pct = Math.round((val / totalSpent) * 100);
    return { name: c.name, color: `oklch(0.5 0.11 ${c.hue})`, valueLabel: fmtBRL(val), pct };
  });

  const totalIncome = entries.filter((e) => e.amount > 0).reduce((a, e) => a + e.amount, 0) || 1;
  const incomeByDesc: { name: string; val: number }[] = [];
  entries
    .filter((e) => e.amount > 0)
    .forEach((e) => {
      let g = incomeByDesc.find((g) => g.name === e.desc);
      if (!g) {
        g = { name: e.desc, val: 0 };
        incomeByDesc.push(g);
      }
      g.val += e.amount;
    });
  const incomeReport = incomeByDesc
    .slice()
    .sort((a, b) => b.val - a.val)
    .map((g) => ({ name: g.name, valueLabel: fmtBRL(g.val), pct: Math.round((g.val / totalIncome) * 100) }));

  const mixedItems = [
    ...spentCats.filter((x) => x.val > 0).map(({ c, val }) => ({ name: c.name, val, type: 'despesa' as const, color: `oklch(0.5 0.11 ${c.hue})` })),
    ...incomeByDesc.map((g) => ({ name: g.name, val: g.val, type: 'receita' as const, color: 'oklch(0.42 0.13 152)' })),
  ]
    .sort((a, b) => b.val - a.val)
    .slice(0, 6);
  const mixedMax = mixedItems.reduce((a, x) => Math.max(a, x.val), 1);
  const mixedReport = mixedItems.map((x) => ({
    name: x.name,
    color: x.color,
    valueColor: x.type === 'receita' ? 'oklch(0.42 0.13 152)' : '#14140F',
    valueLabel: (x.type === 'receita' ? '+ ' : '- ') + fmtBRL(x.val),
    pct: Math.round((x.val / mixedMax) * 100),
  }));

  const saldo = totalIncome - totalSpent;
  const isDespesas = reportView === 'despesas';
  const isReceitas = reportView === 'receitas';
  const isMisto = reportView === 'misto';

  const tabStyle = (active: boolean, activeBg: string): CSSProperties => ({
    flex: 1,
    padding: '9px 6px',
    border: 'none',
    borderRadius: 11,
    fontSize: 12.5,
    fontWeight: 700,
    background: active ? activeBg : 'transparent',
    color: active ? '#fff' : 'rgba(20,20,15,0.55)',
  });

  return (
    <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 20px 130px' }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#14140F', letterSpacing: -0.4, marginBottom: 4 }}>Relatórios</div>
      <div style={{ fontSize: 13.5, color: 'rgba(20,20,15,0.5)', marginBottom: 22 }}>Julho 2026</div>

      <div style={{ display: 'flex', gap: 6, background: 'rgba(20,20,15,0.06)', borderRadius: 14, padding: 4, marginBottom: 20 }}>
        <button style={tabStyle(isDespesas, '#14140F')} onClick={() => onSetReportView('despesas')}>
          Despesas
        </button>
        <button style={tabStyle(isReceitas, 'oklch(0.42 0.13 152)')} onClick={() => onSetReportView('receitas')}>
          Receitas
        </button>
        <button style={tabStyle(isMisto, '#14140F')} onClick={() => onSetReportView('misto')}>
          Misto
        </button>
      </div>

      {isDespesas && (
        <>
          <div style={{ background: '#14140F', borderRadius: 24, padding: '22px 20px', marginBottom: 22 }}>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Total gasto no mês</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{fmtBRL(totalSpent)}</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#14140F', marginBottom: 14 }}>Por categoria</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reportCats.map((cat) => (
              <div key={cat.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#14140F' }}>{cat.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(20,20,15,0.5)', fontVariantNumeric: 'tabular-nums' }}>
                    {cat.valueLabel} · {cat.pct}%
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(20,20,15,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: cat.color, width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isReceitas && (
        <>
          <div style={{ background: 'oklch(0.42 0.13 152)', borderRadius: 24, padding: '22px 20px', marginBottom: 22 }}>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>Total recebido no mês</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{fmtBRL(totalIncome)}</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#14140F', marginBottom: 14 }}>Por origem</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {incomeReport.map((inc) => (
              <div key={inc.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#14140F' }}>{inc.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(20,20,15,0.5)', fontVariantNumeric: 'tabular-nums' }}>
                    {inc.valueLabel} · {inc.pct}%
                  </div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(20,20,15,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: 'oklch(0.42 0.13 152)', width: `${inc.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isMisto && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            <div style={{ flex: 1, minWidth: 0, background: 'oklch(0.42 0.13 152)', borderRadius: 18, padding: '14px 10px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>Receitas</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fmtBRL(totalIncome)}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, background: '#14140F', borderRadius: 18, padding: '14px 10px' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>Despesas</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {fmtBRL(totalSpent)}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, background: '#fff', border: '1px solid rgba(20,20,15,0.1)', borderRadius: 18, padding: '14px 10px' }}>
              <div style={{ fontSize: 11, color: 'rgba(20,20,15,0.5)', marginBottom: 4 }}>Saldo</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: saldo >= 0 ? 'oklch(0.42 0.13 152)' : 'oklch(0.5 0.15 35)',
                  fontVariantNumeric: 'tabular-nums',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {(saldo >= 0 ? '+ ' : '- ') + fmtBRL(Math.abs(saldo))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#14140F', marginBottom: 14 }}>Maiores movimentações</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mixedReport.map((m) => (
              <div key={m.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#14140F' }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: m.valueColor, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{m.valueLabel}</div>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'rgba(20,20,15,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: m.color, width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
