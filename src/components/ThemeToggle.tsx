import { useTheme } from '@/state/theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className="w-10 h-10 rounded-[20px] flex items-center justify-center border-none cursor-pointer flex-shrink-0 bg-ink/6"
    >
      {isDark ? (
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2v2M10 16v2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M2 10h2M16 10h2M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4"
            stroke="var(--color-ink)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="10" cy="10" r="4" fill="var(--color-ink)" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M17 11.5A7.5 7.5 0 018.5 3 7.5 7.5 0 1017 11.5z" fill="var(--color-ink)" />
        </svg>
      )}
    </button>
  );
}
