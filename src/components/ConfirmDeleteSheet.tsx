import { useEffect, useState, type ReactNode } from 'react';
import { Sheet, SheetTitle } from './Sheet';
import { ApiError } from '@/lib/api';

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
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const confirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <SheetTitle>{title}</SheetTitle>
      {detail && <div className="text-[13.5px] text-ink/50 mb-5">{detail}</div>}
      {error && (
        <div className="text-[13px] mb-3.5" style={{ color: 'var(--warning-color)' }}>
          {error}
        </div>
      )}
      <button
        onClick={confirm}
        disabled={isSubmitting}
        className="w-full py-[15px] rounded-2xl text-[15.5px] font-bold cursor-pointer mb-2.5 disabled:cursor-not-allowed"
        style={{
          background: 'var(--btn-danger-bg)',
          color: 'var(--btn-danger-fg)',
          border: '1px solid var(--btn-danger-border)',
        }}
      >
        {isSubmitting ? 'Excluindo…' : confirmLabel}
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
