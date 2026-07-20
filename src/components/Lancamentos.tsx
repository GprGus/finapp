import type { Entry } from '../types';
import { catById, dateLabel, dotColor, fmtBRL } from '../data';

interface Group {
  date: string;
  items: Entry[];
}

interface Props {
  entries: Entry[];
}

export default function Lancamentos({ entries }: Props) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const groups: Group[] = [];
  sorted.forEach((e) => {
    let g = groups.find((g) => g.date === e.date);
    if (!g) {
      g = { date: e.date, items: [] };
      groups.push(g);
    }
    g.items.push(e);
  });

  return (
    <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 20px 130px' }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#14140F', letterSpacing: -0.4, marginBottom: 4 }}>Lançamentos</div>
      <div style={{ fontSize: 13.5, color: 'rgba(20,20,15,0.5)', marginBottom: 22 }}>Adicione ou edite lançamentos de qualquer data</div>

      {groups.map((grp) => (
        <div key={grp.date} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(20,20,15,0.45)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
            {dateLabel(grp.date)}
          </div>
          <div style={{ background: '#fff', border: '1px solid rgba(20,20,15,0.08)', borderRadius: 18, overflow: 'hidden' }}>
            {grp.items.map((item) => {
              const c = catById(item.cat);
              const amountLabel = (item.amount >= 0 ? '+ ' : '- ') + fmtBRL(Math.abs(item.amount));
              const amountColor = item.amount >= 0 ? 'oklch(0.42 0.13 152)' : '#14140F';
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', position: 'relative' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, flexShrink: 0, background: dotColor(c.hue) }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 14.5, color: '#14140F', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                      {item.retro && (
                        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'oklch(0.5 0.15 35)', background: 'oklch(0.5 0.15 35 / 0.12)', padding: '2px 6px', borderRadius: 6, flexShrink: 0 }}>
                          RETROATIVO
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(20,20,15,0.45)' }}>
                      {c.name} · {item.account}
                    </div>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: amountColor }}>{amountLabel}</div>
                  <div style={{ position: 'absolute', bottom: 0, left: 52, right: 16, height: 0.5, background: 'rgba(20,20,15,0.08)' }} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
