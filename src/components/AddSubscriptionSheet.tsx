import { useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass } from './Sheet';
import { useFinance } from '../state/store';
import { todayISO } from '../lib/format';

const HUES = [40, 140, 250, 300, 20, 10, 220, 90, 152, 60];

export function AddSubscriptionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSubscription } = useFinance();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [renewDate, setRenewDate] = useState(todayISO());

  const canSubmit = !!name.trim() && parseFloat(price) > 0 && !!renewDate;

  const submit = () => {
    if (!canSubmit) return;
    const hue = HUES[Math.floor(Math.random() * HUES.length)];
    addSubscription({ name: name.trim(), price: parseFloat(price), renewDate, hue });
    setName('');
    setPrice('');
    setRenewDate(todayISO());
    onClose();
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

      <button
        disabled={!canSubmit}
        onClick={submit}
        className="w-full py-[15px] rounded-2xl border-none text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? '#14140F' : 'rgba(20,20,15,0.15)',
          color: canSubmit ? '#fff' : 'rgba(20,20,15,0.4)',
        }}
      >
        Adicionar assinatura
      </button>
    </Sheet>
  );
}
