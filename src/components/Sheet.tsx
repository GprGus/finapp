import type { CSSProperties, ReactNode } from 'react';

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
        className="fixed inset-0 z-80 animate-fade-in"
        style={{ background: 'var(--sheet-backdrop-color)' }}
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[560px] z-81 rounded-t-[28px] px-5 pt-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+30px)] max-h-[85vh] overflow-auto shadow-[0_-20px_50px_rgba(0,0,0,0.25)] box-border animate-sheet-up border border-b-0"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--overlay-border-color)' }}
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
  'w-full box-border px-3 py-2.5 rounded-xl border border-ink/15 text-[15px] text-ink outline-none focus:border-ink/40 bg-[var(--color-input-bg)]';

// Enabled: outlined/tinted CTA in dark mode, solid dark button in light mode.
// Disabled: a flatter, muted version of the same shape in either theme.
export function primaryButtonStyle(enabled: boolean): CSSProperties {
  return {
    background: enabled ? 'var(--btn-primary-bg)' : 'var(--btn-primary-bg-disabled)',
    color: enabled ? 'var(--btn-primary-fg)' : 'var(--btn-primary-fg-disabled)',
    border: `1px solid ${enabled ? 'var(--btn-primary-border)' : 'transparent'}`,
  };
}

// Text-only "danger" action (Excluir X inside an edit sheet) — transparent bg, warning color.
export const dangerTextButtonStyle: CSSProperties = { color: 'var(--warning-color)' };

// Selectable pill (category/account/toggle pickers). `hue` picks the tinted-selected variant;
// `income` picks the green tinted-selected variant reserved for "receita"; omit both for the
// generic (non-hue) selected look.
export function chipStyle(selected: boolean, hue?: number, income?: boolean): CSSProperties {
  if (!selected) {
    return { background: 'var(--chip-bg)', color: 'var(--chip-fg)', borderColor: 'var(--chip-border)' };
  }
  if (income) {
    return {
      background: 'var(--chip-sel-income-bg)',
      color: 'var(--chip-sel-income-fg)',
      borderColor: 'var(--chip-sel-income-border)',
    };
  }
  if (hue != null) {
    return {
      background: `oklch(var(--chip-sel-hue-l) var(--chip-sel-hue-c) ${hue} / var(--chip-sel-hue-a))`,
      color: `oklch(var(--chip-sel-hue-fg-l) var(--chip-sel-hue-fg-c) ${hue})`,
      borderColor: `oklch(var(--chip-sel-hue-l) var(--chip-sel-hue-c) ${hue})`,
    };
  }
  return { background: 'var(--chip-sel-bg)', color: 'var(--chip-sel-fg)', borderColor: 'var(--chip-sel-border)' };
}
