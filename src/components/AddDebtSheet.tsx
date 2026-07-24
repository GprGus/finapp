import { useEffect, useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass, primaryButtonStyle, chipStyle, dangerTextButtonStyle } from './Sheet';
import { useFinance } from '../state/store';
import { todayISO } from '../lib/format';
import { ApiError } from '../lib/api';
import type { Cadence, Debt } from '../types';

const HUES = [0, 15, 350, 335];

export function AddDebtSheet({
  open,
  editing,
  onClose,
  onRequestDelete,
  onRequestAbate,
}: {
  open: boolean;
  editing?: Debt | null;
  onClose: () => void;
  onRequestDelete?: (debt: Debt) => void;
  onRequestAbate?: (debt: Debt) => void;
}) {
  const { state, addDebt, updateDebt } = useFinance();
  const [name, setName] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [nextChargeDate, setNextChargeDate] = useState(todayISO());
  const [cadence, setCadence] = useState<Cadence>('interval');
  const [intervalDays, setIntervalDays] = useState('30');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? '');
  const [chargeNow, setChargeNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setChargeNow(false);
    if (editing) {
      setName(editing.name);
      setInstallmentAmount(String(editing.installmentAmount));
      setTotalInstallments(String(editing.totalInstallments));
      setPaidInstallments(String(editing.paidInstallments));
      setNextChargeDate(editing.nextChargeDate);
      setCadence(editing.cadence);
      setIntervalDays(String(editing.intervalDays));
      setAccountId(editing.accountId);
    } else {
      setName('');
      setInstallmentAmount('');
      setTotalInstallments('');
      setPaidInstallments('0');
      setNextChargeDate(todayISO());
      setCadence('interval');
      setIntervalDays('30');
      setAccountId(state.accounts[0]?.id ?? '');
    }
  }, [open, editing]);

  const canSubmit =
    !!name.trim() &&
    parseFloat(installmentAmount) > 0 &&
    parseInt(totalInstallments, 10) > 0 &&
    !!nextChargeDate &&
    (cadence === 'monthly' || parseInt(intervalDays, 10) > 0) &&
    !!accountId &&
    (!editing || parseInt(paidInstallments, 10) <= parseInt(totalInstallments, 10)) &&
    !isSubmitting;

  const billingDayPreview = Number(nextChargeDate.slice(8, 10));

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const shared = {
        name: name.trim(),
        accountId,
        installmentAmount: parseFloat(installmentAmount),
        totalInstallments: parseInt(totalInstallments, 10),
        cadence,
        intervalDays: parseInt(intervalDays, 10) || 30,
        nextChargeDate,
      };
      if (editing) {
        await updateDebt(editing.id, {
          ...shared,
          paidInstallments: parseInt(paidInstallments, 10),
          hue: editing.hue,
        });
      } else {
        const hue = HUES[Math.floor(Math.random() * HUES.length)];
        await addDebt({ ...shared, hue, chargeNow });
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar dívida');
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
      <SheetTitle>{editing ? 'Editar dívida' : 'Nova dívida'}</SheetTitle>

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

      {editing && (
        <Field label="Parcelas já pagas">
          <input
            className={inputClass}
            type="number"
            min={0}
            value={paidInstallments}
            onChange={(e) => setPaidInstallments(e.target.value)}
          />
        </Field>
      )}

      <Field label={editing ? 'Próxima cobrança' : 'Primeira cobrança'}>
        <input
          className={inputClass}
          type="date"
          value={nextChargeDate}
          onChange={(e) => setNextChargeDate(e.target.value)}
        />
      </Field>

      <div className="mb-3.5">
        <div className="text-xs text-ink/50 mb-2">Como calcular a próxima parcela?</div>
        <div className="flex gap-2 mb-2.5">
          <button
            onClick={() => setCadence('interval')}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
            style={chipStyle(cadence === 'interval')}
          >
            Qtd. de dias
          </button>
          <button
            onClick={() => setCadence('monthly')}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
            style={chipStyle(cadence === 'monthly')}
          >
            Dia fixo do mês
          </button>
        </div>
        {cadence === 'interval' ? (
          <input
            className={inputClass}
            type="number"
            min={1}
            placeholder="Cobra a cada N dias"
            value={intervalDays}
            onChange={(e) => setIntervalDays(e.target.value)}
          />
        ) : (
          <div className="text-[12.5px] text-ink/50 px-1">
            Cobra todo dia <strong className="text-ink">{billingDayPreview}</strong> de cada mês (ajusta para o
            último dia em meses mais curtos).
          </div>
        )}
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
                style={chipStyle(sel)}
              >
                {a.name}
              </button>
            );
          })}
        </div>
      </div>

      {!editing && (
        <div className="mb-4">
          <div className="text-xs text-ink/50 mb-1.5">Incluir a primeira parcela na fatura atual?</div>
          <div className="flex gap-2">
            <button
              onClick={() => setChargeNow(true)}
              className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
              style={chipStyle(chargeNow)}
            >
              Sim, agora
            </button>
            <button
              onClick={() => setChargeNow(false)}
              className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
              style={chipStyle(!chargeNow)}
            >
              Só nas próximas
            </button>
          </div>
        </div>
      )}

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
        {isSubmitting ? 'Salvando…' : editing ? 'Salvar alterações' : 'Adicionar dívida'}
      </button>

      {editing && onRequestAbate && editing.paidInstallments < editing.totalInstallments && (
        <button
          onClick={() => onRequestAbate(editing)}
          className="w-full py-[13px] rounded-2xl text-[14px] font-bold cursor-pointer bg-transparent mt-2.5 text-accent"
          style={{ border: '1px solid var(--overlay-border-color)' }}
        >
          Lançar abatimento de parcelas
        </button>
      )}

      {editing && onRequestDelete && (
        <button
          onClick={() => onRequestDelete(editing)}
          className="w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent mt-2.5"
          style={dangerTextButtonStyle}
        >
          Excluir dívida
        </button>
      )}
    </Sheet>
  );
}
