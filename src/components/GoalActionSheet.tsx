import { useEffect, useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass, primaryButtonStyle, dangerTextButtonStyle } from './Sheet';
import { useFinance } from '../state/store';
import type { Goal } from '../types';
import { fmtBRL } from '../lib/format';
import { ApiError } from '../lib/api';

export function GoalActionSheet({
  goal,
  onClose,
}: {
  goal: Goal | null;
  onClose: () => void;
}) {
  const { contributeToGoal, updateGoal, deleteGoal } = useFinance();
  const [amount, setAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setEditName(goal.name);
      setEditTarget(String(goal.target));
    }
    setIsEditing(false);
    setAmount('');
    setError(null);
  }, [goal?.id]);

  if (!goal) return null;

  const add = async () => {
    const val = parseFloat(amount);
    if (!val || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await contributeToGoal(goal.id, val);
      setAmount('');
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao contribuir');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveEdit = async () => {
    if (!editName.trim() || !(parseFloat(editTarget) > 0) || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateGoal(goal.id, { name: editName.trim(), target: parseFloat(editTarget), current: goal.current });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar meta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteGoal(goal.id);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir meta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <Sheet open={!!goal} onClose={onClose}>
        <SheetTitle>Editar meta</SheetTitle>

        <Field label="Nome">
          <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} />
        </Field>

        <Field label="Valor alvo (R$)">
          <input
            className={inputClass}
            type="number"
            value={editTarget}
            onChange={(e) => setEditTarget(e.target.value)}
          />
        </Field>

        {error && (
          <div className="text-[13px] mb-3.5" style={{ color: 'var(--warning-color)' }}>
            {error}
          </div>
        )}

        <button
          disabled={!editName.trim() || !(parseFloat(editTarget) > 0) || isSubmitting}
          onClick={saveEdit}
          className="w-full py-[15px] rounded-2xl text-[15.5px] font-bold cursor-pointer mb-2.5 disabled:cursor-not-allowed"
          style={primaryButtonStyle(!!editName.trim() && parseFloat(editTarget) > 0)}
        >
          {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
        </button>

        <button
          onClick={() => setIsEditing(false)}
          className="w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent text-ink/50"
        >
          Cancelar
        </button>
      </Sheet>
    );
  }

  return (
    <Sheet open={!!goal} onClose={onClose}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <SheetTitle>{goal.name}</SheetTitle>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="border-none bg-transparent text-[13px] font-semibold cursor-pointer text-accent flex-shrink-0"
        >
          Editar
        </button>
      </div>
      <div className="text-[13px] text-ink/50 mb-4">
        {fmtBRL(goal.current)} de {fmtBRL(goal.target)} guardados
      </div>

      <Field label="Adicionar valor (R$)">
        <input
          className={inputClass}
          type="number"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>

      {error && (
        <div className="text-[13px] mb-3.5" style={{ color: 'var(--warning-color)' }}>
          {error}
        </div>
      )}

      <button
        disabled={!parseFloat(amount) || isSubmitting}
        onClick={add}
        className="w-full py-[15px] rounded-2xl text-[15.5px] font-bold cursor-pointer mb-2.5 disabled:cursor-not-allowed"
        style={primaryButtonStyle(!!parseFloat(amount))}
      >
        Adicionar à meta
      </button>

      <button
        onClick={remove}
        disabled={isSubmitting}
        className="w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent disabled:cursor-not-allowed"
        style={dangerTextButtonStyle}
      >
        Excluir meta
      </button>
    </Sheet>
  );
}
