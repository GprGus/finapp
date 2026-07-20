import type { CSSProperties } from 'react';
import type { Tab } from '../types';

const ACTIVE = '#14140F';
const INACTIVE = 'rgba(20,20,15,0.35)';

const navButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 5,
  width: 64,
};

const navLabelStyle = (color: string): CSSProperties => ({
  fontSize: 10.5,
  fontWeight: 600,
  color,
});

interface Props {
  tab: Tab;
  onNavigate: (tab: Tab) => void;
  onOpenAdd: () => void;
}

export default function BottomNav({ tab, onNavigate, onOpenAdd }: Props) {
  const colorFor = (t: Tab) => (tab === t ? ACTIVE : INACTIVE);

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 70 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 560, pointerEvents: 'none' }}>
        {tab === 'lancamentos' && (
          <button
            style={{
              position: 'absolute',
              right: 20,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
              width: 56,
              height: 56,
              borderRadius: 28,
              background: 'oklch(0.42 0.13 152)',
              border: 'none',
              color: '#fff',
              fontSize: 28,
              lineHeight: '56px',
              boxShadow: '0 10px 24px rgba(20,20,15,0.25)',
              pointerEvents: 'auto',
            }}
            onClick={onOpenAdd}
          >
            +
          </button>
        )}

        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            padding: '12px 8px calc(env(safe-area-inset-bottom, 0px) + 14px)',
            background: 'rgba(250,250,248,0.86)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderTop: '1px solid rgba(20,20,15,0.08)',
          }}
        >
          <button style={navButtonStyle} onClick={() => onNavigate('dashboard')}>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path d="M3 10L11 3l8 7v8a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-8z" fill={colorFor('dashboard')} />
            </svg>
            <div style={navLabelStyle(colorFor('dashboard'))}>Início</div>
          </button>
          <button style={navButtonStyle} onClick={() => onNavigate('lancamentos')}>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <rect x="3" y="4" width="16" height="2.4" rx="1.2" fill={colorFor('lancamentos')} />
              <rect x="3" y="10" width="16" height="2.4" rx="1.2" fill={colorFor('lancamentos')} />
              <rect x="3" y="16" width="10" height="2.4" rx="1.2" fill={colorFor('lancamentos')} />
            </svg>
            <div style={navLabelStyle(colorFor('lancamentos'))}>Lançamentos</div>
          </button>
          <button style={navButtonStyle} onClick={() => onNavigate('assinaturas')}>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path
                d="M4 8a7 7 0 0112-4.5M4 3.5V8h4.5M18 14a7 7 0 01-12 4.5M18 18.5V14h-4.5"
                stroke={colorFor('assinaturas')}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div style={navLabelStyle(colorFor('assinaturas'))}>Assinaturas</div>
          </button>
          <button style={navButtonStyle} onClick={() => onNavigate('relatorios')}>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <rect x="3" y="11" width="4" height="8" rx="1" fill={colorFor('relatorios')} />
              <rect x="9" y="6" width="4" height="13" rx="1" fill={colorFor('relatorios')} />
              <rect x="15" y="2" width="4" height="17" rx="1" fill={colorFor('relatorios')} />
            </svg>
            <div style={navLabelStyle(colorFor('relatorios'))}>Relatórios</div>
          </button>
        </div>
      </div>
    </div>
  );
}
