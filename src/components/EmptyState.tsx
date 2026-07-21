export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white border border-ink/8 rounded-2xl px-5 py-8 text-center">
      <div className="text-[14.5px] font-semibold text-ink mb-1">{title}</div>
      <div className="text-[13px] text-ink/50 mb-4">{subtitle}</div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="border-none rounded-xl px-4 py-2.5 text-[13.5px] font-bold bg-ink text-white cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
