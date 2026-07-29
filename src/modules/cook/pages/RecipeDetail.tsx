import { useTheme } from '@/state/theme';
import { recipeTileStyle } from '../lib/style';
import type { Recipe } from '../types';

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Voltar"
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

export function RecipeDetail({
  recipe,
  onBack,
  onEdit,
}: {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
}) {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto relative font-sans box-border">
      <div
        className="sticky top-0 z-60 flex items-center justify-between px-3 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-2"
        style={{
          background: 'var(--header-blur-bg)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}
      >
        <BackButton onClick={onBack} />
        <button
          onClick={onEdit}
          className="px-3 py-1.5 rounded-lg text-[13px] font-bold cursor-pointer border-none bg-ink/6 text-ink"
        >
          Editar
        </button>
      </div>

      <div className="px-5 pt-2 pb-12">
        <div className="flex items-center gap-3.5 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-[21px] font-bold flex-shrink-0"
            style={recipeTileStyle(recipe.hue, theme)}
          >
            {recipe.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[24px] font-bold text-ink tracking-tight leading-tight">{recipe.name}</div>
            <div className="text-[13px] text-ink/50 mt-1">
              {recipe.servings != null && `${recipe.servings} porç${recipe.servings === 1 ? 'ão' : 'ões'}`}
              {recipe.servings != null && recipe.prepMinutes != null && ' · '}
              {recipe.prepMinutes != null && `${recipe.prepMinutes} min de preparo`}
            </div>
          </div>
        </div>

        {recipe.ingredients.length > 0 && (
          <div className="mb-7">
            <div className="text-[16px] font-bold text-ink mb-3">Ingredientes</div>
            <div
              className="rounded-2xl border border-ink/8 px-4 py-1"
              style={{ background: 'var(--color-card)' }}
            >
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={ing.id}
                  className="flex items-baseline gap-2.5 py-2.5"
                  style={idx > 0 ? { borderTop: '1px solid rgba(var(--ink-rgb), 0.06)' } : undefined}
                >
                  <span
                    className="text-[13px] font-bold whitespace-nowrap flex-shrink-0"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {[ing.quantity.trim(), ing.unit.trim()].filter(Boolean).join(' ') || '—'}
                  </span>
                  <span className="text-[14.5px] text-ink">{ing.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recipe.steps.length > 0 && (
          <div>
            <div className="text-[16px] font-bold text-ink mb-3">Modo de preparo</div>
            <div className="flex flex-col gap-4">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                    style={{ background: 'rgba(var(--ink-rgb), 0.06)', color: 'var(--color-ink)' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="text-[15px] text-ink leading-relaxed pt-0.5">{step}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
