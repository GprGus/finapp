import { useEffect, useState } from 'react';
import { Sheet, SheetTitle, Field, inputClass, primaryButtonStyle, dangerTextButtonStyle } from '@/components/Sheet';
import { useCook } from '../state/store';
import type { Ingredient, Recipe } from '../types';

const emptyIngredient = (): Ingredient => ({ id: crypto.randomUUID(), name: '', quantity: '', unit: '' });

export function AddRecipeSheet({
  open,
  editing,
  onClose,
  onRequestDelete,
}: {
  open: boolean;
  editing?: Recipe | null;
  onClose: () => void;
  onRequestDelete?: (recipe: Recipe) => void;
}) {
  const { addRecipe, updateRecipe } = useCook();
  const [name, setName] = useState('');
  const [servings, setServings] = useState('');
  const [prepMinutes, setPrepMinutes] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [steps, setSteps] = useState<string[]>(['']);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setServings(editing.servings != null ? String(editing.servings) : '');
      setPrepMinutes(editing.prepMinutes != null ? String(editing.prepMinutes) : '');
      setIngredients(editing.ingredients.length ? editing.ingredients : [emptyIngredient()]);
      setSteps(editing.steps.length ? editing.steps : ['']);
    } else {
      setName('');
      setServings('');
      setPrepMinutes('');
      setIngredients([emptyIngredient()]);
      setSteps(['']);
    }
  }, [open, editing]);

  const canSubmit = name.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const data = {
      name: name.trim(),
      servings: servings.trim() ? Number(servings) : null,
      prepMinutes: prepMinutes.trim() ? Number(prepMinutes) : null,
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.map((s) => s.trim()).filter(Boolean),
      hue: editing?.hue ?? Math.floor(Math.random() * 360),
    };
    if (editing) {
      updateRecipe(editing.id, data);
    } else {
      addRecipe(data);
    }
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>{editing ? 'Editar receita' : 'Nova receita'}</SheetTitle>

      <Field label="Nome da receita">
        <input className={inputClass} placeholder="Ex: Bolo de cenoura" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <div className="flex gap-3">
        <div className="flex-1">
          <Field label="Porções">
            <input
              className={inputClass}
              type="number"
              min="1"
              placeholder="Ex: 4"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Tempo de preparo (min)">
            <input
              className={inputClass}
              type="number"
              min="1"
              placeholder="Ex: 40"
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="text-xs text-ink/50 mb-1.5">Ingredientes</div>
      <div className="flex flex-col gap-2 mb-3.5">
        {ingredients.map((ing) => (
          <div key={ing.id} className="flex gap-2 items-center">
            <input
              className={`${inputClass} flex-[2]`}
              placeholder="Ingrediente"
              value={ing.name}
              onChange={(e) =>
                setIngredients((prev) => prev.map((i) => (i.id === ing.id ? { ...i, name: e.target.value } : i)))
              }
            />
            <input
              className={`${inputClass} flex-1`}
              placeholder="Qtd."
              value={ing.quantity}
              onChange={(e) =>
                setIngredients((prev) => prev.map((i) => (i.id === ing.id ? { ...i, quantity: e.target.value } : i)))
              }
            />
            <input
              className={`${inputClass} flex-1`}
              placeholder="Medida"
              value={ing.unit}
              onChange={(e) =>
                setIngredients((prev) => prev.map((i) => (i.id === ing.id ? { ...i, unit: e.target.value } : i)))
              }
            />
            <button
              onClick={() => setIngredients((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== ing.id) : prev))}
              aria-label="Remover ingrediente"
              className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer bg-ink/6 text-ink/50 flex-shrink-0"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
          className="text-[13px] font-semibold text-left cursor-pointer bg-transparent border-none py-1"
          style={{ color: 'var(--color-accent)' }}
        >
          + Adicionar ingrediente
        </button>
      </div>

      <div className="text-xs text-ink/50 mb-1.5">Modo de preparo</div>
      <div className="flex flex-col gap-2 mb-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <div className="text-[13px] font-bold text-ink/40 pt-2.5 w-5 flex-shrink-0">{idx + 1}.</div>
            <textarea
              className={`${inputClass} flex-1 min-h-[44px]`}
              placeholder={`Passo ${idx + 1}`}
              value={step}
              onChange={(e) => setSteps((prev) => prev.map((s, i) => (i === idx ? e.target.value : s)))}
            />
            <button
              onClick={() => setSteps((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev))}
              aria-label="Remover passo"
              className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer bg-ink/6 text-ink/50 flex-shrink-0 mt-1"
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => setSteps((prev) => [...prev, ''])}
          className="text-[13px] font-semibold text-left cursor-pointer bg-transparent border-none py-1"
          style={{ color: 'var(--color-accent)' }}
        >
          + Adicionar passo
        </button>
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="w-full py-[15px] rounded-2xl text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed mb-2.5"
        style={primaryButtonStyle(canSubmit)}
      >
        {editing ? 'Salvar alterações' : 'Adicionar'}
      </button>

      {editing && onRequestDelete && (
        <button
          onClick={() => onRequestDelete(editing)}
          className="w-full py-3 rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent"
          style={dangerTextButtonStyle}
        >
          Excluir receita
        </button>
      )}
    </Sheet>
  );
}
