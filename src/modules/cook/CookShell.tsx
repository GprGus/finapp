import { useNavigate } from 'react-router-dom';
import { Recipes } from './pages/Recipes';

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Voltar aos módulos"
      className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer bg-transparent flex-shrink-0"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12.5 4.5L6 10l6.5 5.5"
          stroke="var(--color-ink)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function CookShell() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto relative font-sans box-border shadow-[0_0_60px_rgba(20,20,15,0.06)]">
      <div
        className="sticky top-0 z-60 flex items-center gap-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-2"
        style={{
          background: 'var(--header-blur-bg)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
      >
        <BackButton onClick={() => navigate('/modulos')} />
        <div className="text-[15px] font-bold text-ink">Cook</div>
      </div>

      <Recipes />
    </div>
  );
}
