import { useState } from 'react';
import { Field, inputClass, primaryButtonStyle } from '../components/Sheet';
import { useAuth } from '../state/auth';
import { ApiError } from '../lib/api';

export function Login({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !!email.trim() && !!password && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao entrar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto flex flex-col justify-center px-6 font-sans box-border">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Entrar</div>
      <div className="text-[13.5px] text-ink/50 mb-6">Acesse seu App Financeiro</div>

      <Field label="E-mail">
        <input
          className={inputClass}
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </Field>

      <Field label="Senha">
        <input
          className={inputClass}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </Field>

      {error && (
        <div className="text-[13px] mb-3.5" style={{ color: 'var(--warning-color)' }}>
          {error}
        </div>
      )}

      <button
        disabled={!canSubmit}
        onClick={submit}
        className="w-full py-[15px] rounded-2xl text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed mb-3"
        style={primaryButtonStyle(canSubmit)}
      >
        {isSubmitting ? 'Entrando…' : 'Entrar'}
      </button>

      <button
        onClick={onSwitchToRegister}
        className="w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent text-ink/50"
      >
        Criar uma conta
      </button>
    </div>
  );
}
