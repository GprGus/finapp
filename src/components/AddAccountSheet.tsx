import { useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass } from './Sheet';
import { useFinance } from '../state/store';
import { ApiError } from '../lib/api';
import type { AccountType } from '../types';

const TYPES: AccountType[] = ['Corrente', 'Poupança', 'Cartão', 'Investimento', 'Dinheiro'];

export function AddAccountSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addAccount } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Corrente');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !!name.trim() && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await addAccount({ name: name.trim(), type, openingBalance: parseFloat(balance) || 0 });
      setName('');
      setType('Corrente');
      setBalance('');
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao adicionar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>Nova conta</SheetTitle>

      <Field label="Nome">
        <input
          className={inputClass}
          placeholder="Ex: Conta Corrente"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="Tipo">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => {
            const sel = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className="px-3 py-2 rounded-[10px] text-[13px] font-semibold border cursor-pointer"
                style={{
                  background: sel ? 'rgba(20,20,15,0.9)' : '#fff',
                  color: sel ? '#fff' : 'rgba(20,20,15,0.6)',
                  borderColor: sel ? '#14140F' : 'rgba(20,20,15,0.12)',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Saldo inicial (R$)">
        <input
          className={inputClass}
          type="number"
          placeholder="0,00"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
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
        className="w-full py-[15px] rounded-2xl border-none text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? '#14140F' : 'rgba(20,20,15,0.15)',
          color: canSubmit ? '#fff' : 'rgba(20,20,15,0.4)',
        }}
      >
        {isSubmitting ? 'Adicionando…' : 'Adicionar conta'}
      </button>
    </Sheet>
  );
}
