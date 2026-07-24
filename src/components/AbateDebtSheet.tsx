import { useEffect, useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass, primaryButtonStyle } from './Sheet';
import { useFinance } from '../state/store';
import { fmtBRL } from '../lib/format';
import { ApiError } from '../lib/api';
import type { Debt } from '../types';

export function AbateDebtSheet({ debt, onClose }: { debt: Debt | null; onClose: () => void }) {
  const { abateDebt } = useFinance();
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAmount('');
    setInstallments('');
    setError(null);
  }, [debt?.id]);

  if (!debt) return null;

  const remaining = debt.totalInstallments - debt.paidInstallments;
  const installmentsAbated = parseInt(installments, 10);
  const canSubmit =
    parseFloat(amount) > 0 && installmentsAbated > 0 && installmentsAbated <= remaining && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await abateDebt(debt.id, { amount: parseFloat(amount), installmentsAbated });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao lançar abatimento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={!!debt} onClose={onClose}>
      <SheetTitle>Abater parcelas</SheetTitle>
      <div className="text-[13px] text-ink/50 mb-4">
        {debt.name} · {remaining} parcela{remaining === 1 ? '' : 's'} restante{remaining === 1 ? '' : 's'} de{' '}
        {fmtBRL(debt.installmentAmount)}
      </div>

      <Field label="Valor pago (R$)">
        <input
          className={inputClass}
          type="number"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>

      <Field label="Quantas parcelas isso abate?">
        <input
          className={inputClass}
          type="number"
          min={1}
          max={remaining}
          placeholder={`Até ${remaining}`}
          value={installments}
          onChange={(e) => setInstallments(e.target.value)}
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
        {isSubmitting ? 'Lançando…' : 'Lançar abatimento'}
      </button>
    </Sheet>
  );
}
