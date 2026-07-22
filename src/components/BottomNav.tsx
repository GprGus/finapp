import type { Tab } from '../types';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Início' },
  { id: 'lancamentos', label: 'Lançamentos' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'previstos', label: 'Previstos' },
  { id: 'relatorios', label: 'Relatórios' },
];

function Icon({ tab, color }: { tab: Tab; color: string }) {
  switch (tab) {
    case 'dashboard':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22">
          <path d="M3 10L11 3l8 7v8a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-8z" fill={color} />
        </svg>
      );
    case 'lancamentos':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22">
          <rect x="3" y="4" width="16" height="2.4" rx="1.2" fill={color} />
          <rect x="3" y="10" width="16" height="2.4" rx="1.2" fill={color} />
          <rect x="3" y="16" width="10" height="2.4" rx="1.2" fill={color} />
        </svg>
      );
    case 'assinaturas':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22">
          <path
            d="M4 8a7 7 0 0112-4.5M4 3.5V8h4.5M18 14a7 7 0 01-12 4.5M18 18.5V14h-4.5"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'relatorios':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22">
          <rect x="3" y="11" width="4" height="8" rx="1" fill={color} />
          <rect x="9" y="6" width="4" height="13" rx="1" fill={color} />
          <rect x="15" y="2" width="4" height="17" rx="1" fill={color} />
        </svg>
      );
    case 'previstos':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22">
          <rect x="3" y="4" width="16" height="14" rx="2" stroke={color} strokeWidth="2" fill="none" />
          <path d="M3 8.5h16" stroke={color} strokeWidth="2" />
          <path d="M7 2.5v4M15 2.5v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div
      className="pointer-events-auto flex justify-around items-start px-2 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)]"
      style={{
        background: 'rgba(250,250,248,0.86)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        borderTop: '1px solid rgba(20,20,15,0.08)',
      }}
    >
      {TABS.map((t) => {
        const active = tab === t.id;
        const color = active ? '#14140F' : 'rgba(20,20,15,0.35)';
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="bg-transparent border-none flex flex-col items-center gap-1 w-16 cursor-pointer"
          >
            <Icon tab={t.id} color={color} />
            <div className="text-[10.5px] font-semibold" style={{ color }}>
              {t.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
