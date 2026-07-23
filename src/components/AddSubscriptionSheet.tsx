import { useEffect, useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass } from './Sheet';
import { useFinance } from '../state/store';
import { todayISO } from '../lib/format';
import { ApiError } from '../lib/api';
import type { Subscription } from '../types';

const HUES = [40, 140, 250, 300, 20, 10, 220, 90, 152, 60];

export function AddSubscriptionSheet({
  open,
  editing,
  onClose,
  onRequestDelete,
}: {
  open: boolean;
  editing?: Subscription | null;
  onClose: () => void;
  onRequestDelete?: (subscription: Subscription) => void;
}) {
  const { state, addSubscription, updateSubscription } = useFinance();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [nextChargeDate, setNextChargeDate] = useState(todayISO());
  const [intervalDays, setIntervalDays] = useState('30');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? '');
  const [isRecurring, setIsRecurring] = useState(true);
  const [endDate, setEndDate] = useState('');
  const [chargeNow, setChargeNow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setChargeNow(false);
    if (editing) {
      setName(editing.name);
      setPrice(String(editing.price));
      setNextChargeDate(editing.nextChargeDate);
      setIntervalDays(String(editing.intervalDays));
      setAccountId(editing.accountId);
      setIsRecurring(editing.isRecurring);
      setEndDate(editing.endDate ?? '');
    } else {
      setName('');
      setPrice('');
      setNextChargeDate(todayISO());
      setIntervalDays('30');
      setAccountId(state.accounts[0]?.id ?? '');
      setIsRecurring(true);
      setEndDate('');
    }
  }, [open, editing]);

  const canSubmit =
    !!name.trim() &&
    parseFloat(price) > 0 &&
    !!nextChargeDate &&
    parseInt(intervalDays, 10) > 0 &&
    !!accountId &&
    (isRecurring || !!endDate) &&
    !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const shared = {
        name: name.trim(),
        price: parseFloat(price),
        accountId,
        intervalDays: parseInt(intervalDays, 10),
        nextChargeDate,
        isRecurring,
        endDate: isRecurring ? null : endDate,
      };
      if (editing) {
        await updateSubscription(editing.id, { ...shared, hue: editing.hue });
      } else {
        const hue = HUES[Math.floor(Math.random() * HUES.length)];
        await addSubscription({ ...shared, hue, chargeNow });
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar assinatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state.accounts.length === 0) {
    return (
      <Sheet open={open} onClose={onClose}>
        <SheetTitle>Nenhuma conta cadastrada</SheetTitle>
        <div className="text-[13.5px] text-ink/50">
          Cadastre uma conta na tela inicial antes de adicionar assinaturas.
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>{editing ? 'Editar assinatura' : 'Nova assinatura'}</SheetTitle>

      <Field label="Nome">
        <input
          className={inputClass}
          placeholder="Ex: Streaming Vídeo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="Valor (R$)">
        <input
          className={inputClass}
          type="number"
          placeholder="0,00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </Field>

      <div className="flex gap-2.5 mb-3.5">
        <div className="flex-1">
          <Field label="Próxima cobrança">
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

      <div className="mb-3.5">
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

      <div className="mb-3.5">
        <div className="flex gap-2">
          <button
            onClick={() => setIsRecurring(true)}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
            style={{
              borderColor: 'rgba(20,20,15,0.1)',
              background: isRecurring ? '#14140F' : '#fff',
              color: isRecurring ? '#fff' : 'rgba(20,20,15,0.6)',
            }}
          >
            Recorrente
          </button>
          <button
            onClick={() => setIsRecurring(false)}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer"
            style={{
              borderColor: 'rgba(20,20,15,0.1)',
              background: !isRecurring ? '#14140F' : '#fff',
              color: !isRecurring ? '#fff' : 'rgba(20,20,15,0.6)',
            }}
          >
            Com término
          </button>
        </div>
      </div>

      {!isRecurring && (
        <Field label="Data de término">
          <input
            className={inputClass}
            type="date"
            min={nextChargeDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
      )}

      {!editing && (
        <div className="mb-4">
          <div className="text-xs text-ink/50 mb-1.5">Incluir cobrança na fatura atual?</div>
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
      )}

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
        {isSubmitting ? 'Salvando…' : editing ? 'Salvar alterações' : 'Adicionar assinatura'}
      </button>

      {editing && onRequestDelete && (
        <button
          onClick={() => onRequestDelete(editing)}
          className="w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent mt-2.5"
          style={{ color: 'oklch(0.5 0.15 35)' }}
        >
          Excluir assinatura
        </button>
      )}
    </Sheet>
  );
}
