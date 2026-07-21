import type { ReactNode } from 'react';

export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-ink/40 z-80 animate-fade-in"
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[560px] z-81 bg-surface rounded-t-[28px] px-5 pt-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+30px)] max-h-[85vh] overflow-auto shadow-[0_-20px_50px_rgba(0,0,0,0.25)] box-border animate-sheet-up"
      >
        <div className="w-9 h-[5px] rounded-full bg-ink/15 mx-auto mt-1 mb-4" />
        {children}
      </div>
    </>
  );
}

export function SheetTitle({ children }: { children: ReactNode }) {
  return <div className="text-[19px] font-bold text-ink mb-4">{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3.5">
      <div className="text-xs text-ink/50 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

export const inputClass =
  'w-full box-border px-3 py-2.5 rounded-xl border border-ink/15 text-[15px] bg-white text-ink outline-none focus:border-ink/40';
