import { useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass, primaryButtonStyle } from './Sheet';
import { useFinance } from '../state/store';
import { ApiError } from '../lib/api';

export function AddGoalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGoal } = useFinance();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = !!name.trim() && parseFloat(target) > 0 && !isSubmitting;

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await addGoal({ name: name.trim(), target: parseFloat(target), current: parseFloat(current) || 0 });
      setName('');
      setTarget('');
      setCurrent('');
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao adicionar meta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>Nova meta de economia</SheetTitle>

      <Field label="Nome">
        <input
          className={inputClass}
          placeholder="Ex: Reserva de emergência"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>

      <Field label="Valor alvo (R$)">
        <input
          className={inputClass}
          type="number"
          placeholder="0,00"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </Field>

      <Field label="Valor já guardado (R$)">
        <input
          className={inputClass}
          type="number"
          placeholder="0,00"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
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
        {isSubmitting ? 'Adicionando…' : 'Adicionar meta'}
      </button>
    </Sheet>
  );
}
