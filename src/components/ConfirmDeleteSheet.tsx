import type { ReactNode } from 'react';
import { Sheet, SheetTitle } from './Sheet';

export function ConfirmDeleteSheet({
  open,
  title,
  detail,
  confirmLabel = 'Excluir',
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  detail?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>{title}</SheetTitle>
      {detail && <div className="text-[13.5px] text-ink/50 mb-5">{detail}</div>}
      <button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        className="w-full py-[15px] rounded-2xl border-none text-[15.5px] font-bold cursor-pointer mb-2.5"
        style={{ background: 'oklch(0.5 0.15 35 / 0.12)', color: 'oklch(0.5 0.15 35)' }}
      >
        {confirmLabel}
      </button>
      <button
        onClick={onClose}
        className="w-full py-[13px] rounded-2xl border-none text-[14px] font-bold cursor-pointer bg-transparent text-ink/50"
      >
        Cancelar
      </button>
    </Sheet>
  );
}
