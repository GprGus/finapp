import type { Account, Entry, Goal } from '../types';
import { catById, dotColor, fmtBRL } from '../data';

interface Props {
  accounts: Account[];
  goals: Goal[];
  recentEntries: Entry[];
  onSeeAll: () => void;
}

export default function Dashboard({ accounts, goals, recentEntries, onSeeAll }: Props) {
  const totalBalance = accounts.reduce((a, b) => a + b.balance, 0);

  return (
    <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 20px 110px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 13, color: 'rgba(20,20,15,0.5)', letterSpacing: -0.1 }}>Boa tarde</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#14140F', letterSpacing: -0.3 }}>Vinícius</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: '#14140F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>
          V
        </div>
      </div>

      <div style={{ background: '#14140F', borderRadius: 24, padding: '22px 20px', marginBottom: 18 }}>
        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>Saldo total</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -0.6, fontVariantNumeric: 'tabular-nums' }}>{fmtBRL(totalBalance)}</div>
        <div style={{ fontSize: 12.5, color: 'oklch(0.72 0.13 152)', marginTop: 6 }}>+ 3,2% este mês</div>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -20px 22px', padding: '0 20px' }}>
        {accounts.map((acc) => (
          <div key={acc.name} style={{ flex: 'none', width: 168, background: '#fff', border: '1px solid rgba(20,20,15,0.08)', borderRadius: 18, padding: 16 }}>
            <div style={{ fontSize: 11, color: 'rgba(20,20,15,0.45)', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 8 }}>{acc.type}</div>
            <div style={{ fontSize: 13.5, color: '#14140F', fontWeight: 600, marginBottom: 14 }}>{acc.name}</div>
            <div style={{ fontSize: 16.5, fontWeight: 700, color: '#14140F', fontVariantNumeric: 'tabular-nums' }}>{fmtBRL(acc.balance)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#14140F' }}>Metas de economia</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
        {goals.map((g) => {
          const pct = Math.round((g.current / g.target) * 100);
          return (
            <div key={g.name} style={{ background: '#fff', border: '1px solid rgba(20,20,15,0.08)', borderRadius: 16, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#14140F' }}>{g.name}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(20,20,15,0.5)' }}>
                  {fmtBRL(g.current)} / {fmtBRL(g.target)}
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(20,20,15,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: 'oklch(0.42 0.13 152)', width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#14140F' }}>Últimos lançamentos</div>
        <button style={{ border: 'none', background: 'none', fontSize: 13, color: 'oklch(0.42 0.13 152)', fontWeight: 600 }} onClick={onSeeAll}>
          Ver tudo
        </button>
      </div>
      <div style={{ background: '#fff', border: '1px solid rgba(20,20,15,0.08)', borderRadius: 18, overflow: 'hidden' }}>
        {recentEntries.map((item) => {
          const c = catById(item.cat);
          const amountLabel = (item.amount >= 0 ? '+ ' : '- ') + fmtBRL(Math.abs(item.amount));
          const amountColor = item.amount >= 0 ? 'oklch(0.42 0.13 152)' : '#14140F';
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', position: 'relative' }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, flexShrink: 0, background: dotColor(c.hue) }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, color: '#14140F', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                <div style={{ fontSize: 12, color: 'rgba(20,20,15,0.45)' }}>{c.name}</div>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: amountColor }}>{amountLabel}</div>
              <div style={{ position: 'absolute', bottom: 0, left: 52, right: 16, height: 0.5, background: 'rgba(20,20,15,0.08)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
