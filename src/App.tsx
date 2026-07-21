import { useState } from 'react';
import { FinanceProvider, useFinance } from './state/store';
import { AuthProvider, useAuth } from './state/auth';
import { BottomNav } from './components/BottomNav';
import { AddEntrySheet } from './components/AddEntrySheet';
import { ProfileSheet } from './components/ProfileSheet';
import { Dashboard } from './pages/Dashboard';
import { Lancamentos } from './pages/Lancamentos';
import { Assinaturas } from './pages/Assinaturas';
import { Relatorios } from './pages/Relatorios';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import type { Tab } from './types';

function AppShell() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showAdd, setShowAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, updateProfile } = useAuth();
  const { isLoading, error } = useFinance();
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
        <div className="text-[13.5px]" style={{ color: 'oklch(0.5 0.15 35)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto relative font-sans box-border shadow-[0_0_60px_rgba(20,20,15,0.06)]">
      {tab === 'dashboard' && (
        <Dashboard name={name} onOpenProfile={() => setShowProfile(true)} onNavigate={setTab} />
      )}
      {tab === 'lancamentos' && <Lancamentos />}
      {tab === 'assinaturas' && <Assinaturas />}
      {tab === 'relatorios' && <Relatorios />}

      <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-70">
        <div className="relative w-full max-w-[560px] pointer-events-none">
          {tab === 'lancamentos' && (
            <button
              onClick={() => setShowAdd(true)}
              className="absolute right-5 bottom-[calc(env(safe-area-inset-bottom,0px)+92px)] w-14 h-14 rounded-[28px] border-none text-white text-[28px] leading-[56px] shadow-[0_10px_24px_rgba(20,20,15,0.25)] pointer-events-auto cursor-pointer bg-accent"
            >
              +
            </button>
          )}
          <BottomNav tab={tab} onChange={setTab} />
        </div>
      </div>

      <AddEntrySheet open={showAdd} onClose={() => setShowAdd(false)} />
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
