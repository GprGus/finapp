import { useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass } from './Sheet';
import { useFinance } from '../state/store';
import { todayISO } from '../lib/format';
import { ApiError } from '../lib/api';

const HUES = [40, 140, 250, 300, 20, 10, 220, 90, 152, 60];

export function AddSubscriptionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSubscription } = useFinance();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [renewDate, setRenewDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !!name.trim() && parseFloat(price) > 0 && !!renewDate && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const hue = HUES[Math.floor(Math.random() * HUES.length)];
      await addSubscription({ name: name.trim(), price: parseFloat(price), renewDate, hue });
      setName('');
      setPrice('');
      setRenewDate(todayISO());
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao adicionar assinatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>Nova assinatura</SheetTitle>

      <Field label="Nome">
        <input
          className={inputClass}
          placeholder="Ex: Streaming Vídeo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="Valor mensal (R$)">
        <input
          className={inputClass}
          type="number"
          placeholder="0,00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </Field>

      <Field label="Próxima renovação">
        <input
          className={inputClass}
          type="date"
          value={renewDate}
          onChange={(e) => setRenewDate(e.target.value)}
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
        {isSubmitting ? 'Adicionando…' : 'Adicionar assinatura'}
      </button>
    </Sheet>
  );
}
