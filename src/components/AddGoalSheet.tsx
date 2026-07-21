import { useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass } from './Sheet';
import { useFinance } from '../state/store';

export function AddGoalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addGoal } = useFinance();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');

  const canSubmit = !!name.trim() && parseFloat(target) > 0;

  const submit = () => {
    if (!canSubmit) return;
    addGoal({ name: name.trim(), target: parseFloat(target), current: parseFloat(current) || 0 });
    setName('');
    setTarget('');
    setCurrent('');
    onClose();
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

      <button
        disabled={!canSubmit}
        onClick={submit}
        className="w-full py-[15px] rounded-2xl border-none text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed"
        style={{
          background: canSubmit ? '#14140F' : 'rgba(20,20,15,0.15)',
          color: canSubmit ? '#fff' : 'rgba(20,20,15,0.4)',
        }}
      >
        Adicionar meta
      </button>
    </Sheet>
  );
}
