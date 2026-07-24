import { useEffect, useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass, primaryButtonStyle, chipStyle, dangerTextButtonStyle } from './Sheet';
import { useFinance } from '../state/store';
import { ApiError } from '../lib/api';
import type { Account, AccountType } from '../types';

const TYPES: AccountType[] = ['Corrente', 'Poupança', 'Cartão', 'Investimento', 'Dinheiro'];

export function AddAccountSheet({
  open,
  editing,
  onClose,
  onRequestDelete,
}: {
  open: boolean;
  editing?: Account | null;
  onClose: () => void;
  onRequestDelete?: (account: Account) => void;
}) {
  const { addAccount, updateAccount } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('Corrente');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (editing) {
      setName(editing.name);
      setType(editing.type);
      setBalance(String(editing.openingBalance));
    } else {
      setName('');
      setType('Corrente');
      setBalance('');
    }
  }, [open, editing]);

  const canSubmit = !!name.trim() && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const input = { name: name.trim(), type, openingBalance: parseFloat(balance) || 0 };
      if (editing) {
        await updateAccount(editing.id, input);
      } else {
        await addAccount(input);
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar conta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>{editing ? 'Editar conta' : 'Nova conta'}</SheetTitle>

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
                style={chipStyle(sel)}
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
        <div className="text-[13px] mb-3.5" style={{ color: 'var(--warning-color)' }}>
          {error}
        </div>
      )}

      <button
        disabled={!canSubmit}
        onClick={submit}
        className="w-full py-[15px] rounded-2xl text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed"
        style={primaryButtonStyle(canSubmit)}
      >
        {isSubmitting ? 'Salvando…' : editing ? 'Salvar alterações' : 'Adicionar conta'}
      </button>

      {editing && onRequestDelete && (
        <button
          onClick={() => onRequestDelete(editing)}
          className="w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent mt-2.5"
          style={dangerTextButtonStyle}
        >
          Excluir conta
        </button>
      )}
    </Sheet>
  );
}
