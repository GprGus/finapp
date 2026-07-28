import { useNavigate } from 'react-router-dom';
import type { Tab } from '../types';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Início' },
  { id: 'lancamentos', label: 'Lançamentos' },
  { id: 'assinaturas', label: 'Assinaturas' },
  { id: 'dividas', label: 'Dívidas' },
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
    case 'dividas':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22">
          <rect x="2" y="5" width="18" height="13" rx="2" stroke={color} strokeWidth="2" fill="none" />
          <path d="M2 9h18" stroke={color} strokeWidth="2" />
          <rect x="5" y="13" width="5" height="2" rx="1" fill={color} />
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
    case 'relatorios':
      return (
        <svg width="22" height="22" viewBox="0 0 22 22">
          <rect x="3" y="11" width="4" height="8" rx="1" fill={color} />
          <rect x="9" y="6" width="4" height="13" rx="1" fill={color} />
          <rect x="15" y="2" width="4" height="17" rx="1" fill={color} />
        </svg>
      );
  }
}

export function SideDrawer({
  open,
  tab,
  onChange,
  onClose,
  onLogout,
}: {
  open: boolean;
  tab: Tab;
  onChange: (t: Tab) => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-90 animate-fade-in"
        style={{ background: 'var(--backdrop-color)' }}
        onClick={onClose}
      />
      <div
        className="fixed left-0 top-0 bottom-0 w-[250px] z-91 bg-surface shadow-[20px_0_50px_rgba(0,0,0,0.15)] border-r px-3 pt-[calc(env(safe-area-inset-top,0px)+22px)] pb-[calc(env(safe-area-inset-bottom,0px)+20px)] overflow-auto box-border animate-slide-in-left"
        style={{ borderColor: 'var(--overlay-border-color)' }}
      >
        <button
          onClick={() => {
            onClose();
            navigate('/modulos');
          }}
          className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl border-none cursor-pointer text-left bg-transparent text-[13px] font-semibold text-ink/45"
        >
          ← Módulos
        </button>
        <div className="text-[11px] font-bold text-ink/40 uppercase tracking-wide px-3 mb-3">Navegação</div>
        <div className="flex flex-col gap-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            const color = active ? 'var(--drawer-active-fg)' : 'rgba(var(--ink-rgb), 0.45)';
            return (
              <button
                key={t.id}
                onClick={() => {
                  onChange(t.id);
                  onClose();
                }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl border-none cursor-pointer text-left"
                style={{ background: active ? 'var(--drawer-active-bg)' : 'transparent' }}
              >
                <Icon tab={t.id} color={color} />
                <div className="text-[14.5px] font-semibold" style={{ color }}>
                  {t.label}
                </div>
              </button>
            );
          })}
        </div>
        <div className="h-px my-4 mx-2 bg-ink/8" />
        <button
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl border-none cursor-pointer text-left bg-transparent w-full text-[14.5px] font-semibold text-ink/45"
        >
          Sair
        </button>
      </div>
    </>
  );
}
