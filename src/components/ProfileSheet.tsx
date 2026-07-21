import { useState, useEffect } from 'react';
import { Sheet, SheetTitle, Field, inputClass } from './Sheet';

export function ProfileSheet({
  open,
  name,
  onSave,
  onClose,
}: {
  open: boolean;
  name: string;
  onSave: (name: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(name);

  useEffect(() => {
    if (open) setValue(name);
  }, [open, name]);

  const submit = () => {
    onSave(value.trim());
    onClose();
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
      <button
        onClick={submit}
        className="w-full py-[15px] rounded-2xl border-none text-[15.5px] font-bold cursor-pointer bg-ink text-white"
      >
        Salvar
      </button>
    </Sheet>
  );
}
