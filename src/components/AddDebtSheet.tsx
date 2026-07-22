import { useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass } from './Sheet';
import { useFinance } from '../state/store';
import { todayISO } from '../lib/format';
import { ApiError } from '../lib/api';

const HUES = [0, 15, 350, 335];

export function AddDebtSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, addDebt } = useFinance();
  const [name, setName] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [nextChargeDate, setNextChargeDate] = useState(todayISO());
  const [intervalDays, setIntervalDays] = useState('30');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? '');
  const [chargeNow, setChargeNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    !!name.trim() &&
    parseFloat(installmentAmount) > 0 &&
    parseInt(totalInstallments, 10) > 0 &&
    !!nextChargeDate &&
    parseInt(intervalDays, 10) > 0 &&
    !!accountId &&
    !isSubmitting;

  const reset = () => {
    setName('');
    setInstallmentAmount('');
    setTotalInstallments('');
    setNextChargeDate(todayISO());
    setIntervalDays('30');
    setChargeNow(false);
  };

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const hue = HUES[Math.floor(Math.random() * HUES.length)];
      await addDebt({
        name: name.trim(),
        accountId,
        installmentAmount: parseFloat(installmentAmount),
        totalInstallments: parseInt(totalInstallments, 10),
        intervalDays: parseInt(intervalDays, 10),
        nextChargeDate,
        hue,
        chargeNow,
      });
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao adicionar dívida');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.accounts.length === 0) {
    return (
      <Sheet open={open} onClose={onClose}>
        <SheetTitle>Nenhuma conta cadastrada</SheetTitle>
        <div className="text-[13.5px] text-ink/50">
          Cadastre uma conta na tela inicial antes de adicionar dívidas.
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>Nova dívida</SheetTitle>

      <Field label="Nome">
        <input
          className={inputClass}
          placeholder="Ex: Fatura renegociada, Empréstimo, Financiamento do carro"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <div className="flex gap-2.5 mb-3.5">
        <div className="flex-1">
          <Field label="Valor da parcela (R$)">
            <input
              className={inputClass}
              type="number"
              placeholder="0,00"
              value={installmentAmount}
              onChange={(e) => setInstallmentAmount(e.target.value)}
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Nº de parcelas">
            <input
              className={inputClass}
              type="number"
              min={1}
              placeholder="Ex: 5"
              value={totalInstallments}
              onChange={(e) => setTotalInstallments(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="flex gap-2.5 mb-3.5">
        <div className="flex-1">
          <Field label="Primeira cobrança">
            <input
              className={inputClass}
              type="date"
              value={nextChargeDate}
              onChange={(e) => setNextChargeDate(e.target.value)}
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Cobra a cada (dias)">
            <input
              className={inputClass}
              type="number"
              min={1}
              value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-ink/50 mb-2">Conta</div>
        <div className="flex gap-2 flex-wrap">
          {state.accounts.map((a) => {
            const sel = accountId === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setAccountId(a.id)}
                className="px-3 py-2 rounded-[10px] text-[13px] font-semibold border cursor-pointer"
                style={{
                  background: sel ? 'rgba(20,20,15,0.9)' : '#fff',
                  color: sel ? '#fff' : 'rgba(20,20,15,0.6)',
                  borderColor: sel ? '#14140F' : 'rgba(20,20,15,0.12)',
                }}
              >
                {a.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-ink/50 mb-1.5">Incluir a primeira parcela na fatura atual?</div>
        <div className="flex gap-2">
          <button
            onClick={() => setChargeNow(true)}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
            style={{
              borderColor: 'rgba(20,20,15,0.1)',
              background: chargeNow ? '#14140F' : '#fff',
              color: chargeNow ? '#fff' : 'rgba(20,20,15,0.6)',
            }}
          >
            Sim, agora
          </button>
          <button
            onClick={() => setChargeNow(false)}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
            style={{
              borderColor: 'rgba(20,20,15,0.1)',
              background: !chargeNow ? '#14140F' : '#fff',
              color: !chargeNow ? '#fff' : 'rgba(20,20,15,0.6)',
            }}
          >
            Só nas próximas
          </button>
        </div>
      </div>

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
        {isSubmitting ? 'Adicionando…' : 'Adicionar dívida'}
      </button>
    </Sheet>
  );
}
