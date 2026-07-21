import { useState } from 'react';
import { Field, inputClass } from '../components/Sheet';
import { useAuth } from '../state/auth';
import { ApiError } from '../lib/api';

export function Register({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !!email.trim() && password.length >= 8 && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await register(email.trim(), password, name.trim() || undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto flex flex-col justify-center px-6 font-sans box-border">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Criar conta</div>
      <div className="text-[13.5px] text-ink/50 mb-6">Comece a controlar suas finanças</div>

      <Field label="Nome">
        <input
          className={inputClass}
          placeholder="Ex: Vinícius"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="E-mail">
        <input
          className={inputClass}
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Senha (mínimo 8 caracteres)">
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
        <div className="text-[13px] mb-3.5" style={{ color: 'oklch(0.5 0.15 35)' }}>
          {error}
        </div>
      )}

      <button
        disabled={!canSubmit}
        onClick={submit}
        className="w-full py-[15px] rounded-2xl border-none text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed mb-3"
        style={{
          background: canSubmit ? '#14140F' : 'rgba(20,20,15,0.15)',
          color: canSubmit ? '#fff' : 'rgba(20,20,15,0.4)',
        }}
      >
        {isSubmitting ? 'Criando…' : 'Criar conta'}
      </button>

      <button
        onClick={onSwitchToLogin}
        className="w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent text-ink/50"
      >
        Já tenho uma conta
      </button>
    </div>
  );
}
