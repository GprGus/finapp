import { useState, useEffect } from 'react';
import { Sheet, SheetTitle, Field, inputClass, primaryButtonStyle } from './Sheet';
import { ApiError } from '../lib/api';

export function ProfileSheet({
  open,
  name,
  onSave,
  onClose,
}: {
  open: boolean;
  name: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValue(name);
      setError(null);
    }
  }, [open, name]);

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(value.trim());
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao salvar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>Seu nome</SheetTitle>
      <Field label="Como devemos te chamar?">
        <input
          className={inputClass}
          placeholder="Ex: Vinícius"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </Field>
      {error && (
        <div className="text-[13px] mb-3.5" style={{ color: 'var(--warning-color)' }}>
          {error}
        </div>
      )}
      <button
        onClick={submit}
        disabled={isSubmitting}
        className="w-full py-[15px] rounded-2xl text-[15.5px] font-bold cursor-pointer disabled:cursor-not-allowed"
        style={primaryButtonStyle(!isSubmitting)}
      >
        {isSubmitting ? 'Salvando…' : 'Salvar'}
      </button>
    </Sheet>
  );
}
