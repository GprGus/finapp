import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/state/auth';
import { ModuleSelector } from './pages/ModuleSelector';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { FinApp } from './modules/finapp';

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
    <Routes>
      <Route path="/modulos" element={<ModuleSelector />} />
      <Route path="/finapp/*" element={<FinApp />} />
      <Route path="*" element={<Navigate to="/modulos" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
