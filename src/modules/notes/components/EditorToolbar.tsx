import type { ReactNode } from 'react';

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      // Prevent the contentEditable from losing focus/selection when a toolbar button is pressed —
      // execCommand acts on whatever selection was live just before the click.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="w-9 h-9 rounded-lg flex items-center justify-center border-none cursor-pointer bg-ink/6 text-ink flex-shrink-0"
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  onCommand,
  onInsertImage,
}: {
  onCommand: (command: string) => void;
  onInsertImage: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-b" style={{ borderColor: 'var(--overlay-border-color)' }}>
      <ToolbarButton label="Negrito" onClick={() => onCommand('bold')}>
        <span className="text-[14px] font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton label="Itálico" onClick={() => onCommand('italic')}>
        <span className="text-[14px] italic font-serif">I</span>
      </ToolbarButton>
      <ToolbarButton label="Sublinhado" onClick={() => onCommand('underline')}>
        <span className="text-[14px] underline">S</span>
      </ToolbarButton>
      <div className="w-px h-5 bg-ink/10 mx-1 flex-shrink-0" />
      <ToolbarButton label="Lista com marcadores" onClick={() => onCommand('insertUnorderedList')}>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="2" cy="4" r="1.2" fill="currentColor" />
          <circle cx="2" cy="8" r="1.2" fill="currentColor" />
          <circle cx="2" cy="12" r="1.2" fill="currentColor" />
          <rect x="5.5" y="3.2" width="9" height="1.6" rx="0.8" fill="currentColor" />
          <rect x="5.5" y="7.2" width="9" height="1.6" rx="0.8" fill="currentColor" />
          <rect x="5.5" y="11.2" width="9" height="1.6" rx="0.8" fill="currentColor" />
        </svg>
      </ToolbarButton>
      <ToolbarButton label="Lista numerada" onClick={() => onCommand('insertOrderedList')}>
        <svg width="16" height="16" viewBox="0 0 16 16">
          <text x="0.5" y="5.5" fontSize="4.5" fill="currentColor">1.</text>
          <text x="0.5" y="9.5" fontSize="4.5" fill="currentColor">2.</text>
          <text x="0.5" y="13.5" fontSize="4.5" fill="currentColor">3.</text>
          <rect x="5.5" y="3.2" width="9" height="1.6" rx="0.8" fill="currentColor" />
          <rect x="5.5" y="7.2" width="9" height="1.6" rx="0.8" fill="currentColor" />
          <rect x="5.5" y="11.2" width="9" height="1.6" rx="0.8" fill="currentColor" />
        </svg>
      </ToolbarButton>
      <div className="w-px h-5 bg-ink/10 mx-1 flex-shrink-0" />
      <ToolbarButton label="Inserir imagem" onClick={onInsertImage}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="5.2" cy="6" r="1.1" fill="currentColor" />
          <path d="M2.5 12l3.5-4 2.5 2.8L11 8l3 4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
        </svg>
      </ToolbarButton>
    </div>
  );
}
