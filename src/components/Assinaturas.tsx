import type { Subscription } from '../types';
import { fmtBRL, TODAY } from '../data';

interface Props {
  subscriptions: Subscription[];
}

export default function Assinaturas({ subscriptions }: Props) {
  const subsTotal = subscriptions.reduce((a, b) => a + b.price, 0);
  const today = new Date(TODAY + 'T00:00:00');

  return (
    <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 20px 130px' }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#14140F', letterSpacing: -0.4, marginBottom: 4 }}>Assinaturas</div>
      <div style={{ fontSize: 13.5, color: 'rgba(20,20,15,0.5)', marginBottom: 22 }}>{fmtBRL(subsTotal)} por mês em recorrências</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {subscriptions.map((sub) => {
          const days = Math.round((new Date(sub.renew + 'T00:00:00').getTime() - today.getTime()) / 86400000);
          const urgent = days <= 5;
          const color = `oklch(0.55 0.1 ${sub.hue})`;
          const badgeColor = urgent ? 'oklch(0.5 0.15 35)' : 'rgba(20,20,15,0.55)';
          const badgeBg = urgent ? 'oklch(0.5 0.15 35 / 0.12)' : 'rgba(20,20,15,0.06)';
          return (
            <div key={sub.name} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid rgba(20,20,15,0.08)', borderRadius: 18, padding: '14px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, flexShrink: 0 }}>
                {sub.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: '#14140F' }}>{sub.name}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(20,20,15,0.5)', marginTop: 2 }}>{fmtBRL(sub.price)}/mês</div>
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 700, padding: '5px 9px', borderRadius: 8, color: badgeColor, background: badgeBg, whiteSpace: 'nowrap' }}>
                Renova em {days}d
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
