import { useState } from 'react';
import { FinanceProvider, useFinance } from './state/store';
import { AuthProvider, useAuth } from './state/auth';
import { SideDrawer } from './components/SideDrawer';
import { AddEntrySheet } from './components/AddEntrySheet';
import { ConfirmDeleteSheet } from './components/ConfirmDeleteSheet';
import { ProfileSheet } from './components/ProfileSheet';
import { Dashboard } from './pages/Dashboard';
import { Lancamentos } from './pages/Lancamentos';
import { Assinaturas } from './pages/Assinaturas';
import { Dividas } from './pages/Dividas';
import { GastosPrevistos } from './pages/GastosPrevistos';
import { Relatorios } from './pages/Relatorios';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import type { Entry, Tab } from './types';

function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Abrir menu"
      className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent flex-shrink-0"
    >
      <svg width="20" height="20" viewBox="0 0 22 22">
        <rect x="3" y="5" width="16" height="2.2" rx="1.1" fill="var(--color-ink)" />
        <rect x="3" y="10" width="16" height="2.2" rx="1.1" fill="var(--color-ink)" />
        <rect x="3" y="15" width="16" height="2.2" rx="1.1" fill="var(--color-ink)" />
      </svg>
    </button>
  );
}

function AppShell() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deleteEntryTarget, setDeleteEntryTarget] = useState<Entry | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { user, updateProfile, logout } = useAuth();
  const { isLoading, error, deleteEntry } = useFinance();
  const name = user?.name ?? '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface max-w-[560px] mx-auto flex items-center justify-center font-sans box-border">
        <div className="text-ink/40 text-sm">Carregando…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface max-w-[560px] mx-auto flex items-center justify-center font-sans box-border px-6 text-center">
        <div className="text-[13.5px]" style={{ color: 'var(--warning-color)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto relative font-sans box-border shadow-[0_0_60px_rgba(20,20,15,0.06)]">
      <div
        className="sticky top-0 z-60 flex items-center px-4 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-2"
        style={{
          background: 'var(--header-blur-bg)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
      >
        <MenuButton onClick={() => setShowDrawer(true)} />
      </div>

      {tab === 'dashboard' && (
        <Dashboard name={name} onOpenProfile={() => setShowProfile(true)} onNavigate={setTab} />
      )}
      {tab === 'lancamentos' && <Lancamentos onSelectEntry={setEditingEntry} />}
      {tab === 'assinaturas' && <Assinaturas />}
      {tab === 'dividas' && <Dividas />}
      {tab === 'previstos' && <GastosPrevistos />}
      {tab === 'relatorios' && <Relatorios />}

      {tab === 'lancamentos' && (
        <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-70">
          <div className="relative w-full max-w-[560px] pointer-events-none">
            <button
              onClick={() => setShowAdd(true)}
              className="absolute right-5 bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] w-14 h-14 rounded-[28px] flex items-center justify-center text-[28px] leading-none pointer-events-auto cursor-pointer"
              style={{
                boxShadow: 'var(--fab-shadow)',
                background: 'var(--fab-bg)',
                border: '1px solid var(--fab-border)',
                color: 'var(--fab-fg)',
              }}
            >
              +
            </button>
          </div>
        </div>
      )}

      <SideDrawer
        open={showDrawer}
        tab={tab}
        onChange={setTab}
        onClose={() => setShowDrawer(false)}
        onLogout={logout}
      />
      <AddEntrySheet
        open={showAdd || !!editingEntry}
        editing={editingEntry}
        onClose={() => {
          setShowAdd(false);
          setEditingEntry(null);
        }}
        onRequestDelete={(entry) => {
          setEditingEntry(null);
          setDeleteEntryTarget(entry);
        }}
      />
      <ConfirmDeleteSheet
        open={!!deleteEntryTarget}
        title={`Excluir "${deleteEntryTarget?.desc}"?`}
        onConfirm={async () => {
          if (deleteEntryTarget) await deleteEntry(deleteEntryTarget.id);
        }}
        onClose={() => setDeleteEntryTarget(null)}
      />
      <ProfileSheet
        open={showProfile}
        name={name}
        onSave={updateProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface max-w-[560px] mx-auto flex items-center justify-center font-sans box-border">
        <div className="text-ink/40 text-sm">Carregando…</div>
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <FinanceProvider>
      <AppShell />
    </FinanceProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
