import { useCook } from '../state/store';
import { useTheme } from '@/state/theme';
import { recipeTileStyle } from '../lib/style';
import { EmptyState } from '@/components/EmptyState';
import type { Recipe } from '../types';

export function Recipes({
  onSelectRecipe,
  onAdd,
}: {
  onSelectRecipe: (recipe: Recipe) => void;
  onAdd: () => void;
}) {
  const { recipes } = useCook();
  const { theme } = useTheme();

  return (
    <div className="px-5 pt-5 pb-[calc(env(safe-area-inset-bottom,0px)+110px)]">
      <div className="text-[26px] font-bold text-ink tracking-tight mb-1">Receitas</div>
      <div className="text-[13.5px] text-ink/50 mb-[22px]">
        {recipes.length} receita{recipes.length === 1 ? '' : 's'} cadastrada{recipes.length === 1 ? '' : 's'}
      </div>

      {recipes.length === 0 && (
        <EmptyState title="Nenhuma receita ainda" subtitle="Toque no botão + para cadastrar sua primeira receita" />
      )}

      <div className="flex flex-col gap-3">
        {recipes.map((recipe) => (
          <button
            key={recipe.id}
            onClick={() => onSelectRecipe(recipe)}
            className="text-left flex items-center gap-3.5 border border-ink/8 rounded-[18px] px-4 py-3.5 cursor-pointer"
            style={{ background: 'var(--color-card)' }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[17px] font-bold flex-shrink-0"
              style={recipeTileStyle(recipe.hue, theme)}
            >
              {recipe.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-semibold text-ink">{recipe.name}</div>
              <div className="text-[12.5px] text-ink/50 mt-0.5">
                {recipe.ingredients.length} ingrediente{recipe.ingredients.length === 1 ? '' : 's'}
                {recipe.prepMinutes != null && ` · ${recipe.prepMinutes} min`}
                {recipe.servings != null && ` · ${recipe.servings} porções`}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="fixed left-0 right-0 bottom-0 flex justify-center pointer-events-none z-70">
        <div className="relative w-full max-w-[560px] pointer-events-none">
          <button
            onClick={onAdd}
            aria-label="Nova receita"
            className="absolute right-5 bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] w-14 h-14 rounded-[28px] flex items-center justify-center text-[28px] leading-none pointer-events-auto cursor-pointer"
            style={{
              boxShadow: 'var(--fab-shadow)',
              background: 'var(--fab-bg)',
              border: '1px solid var(--fab-border)',
              color: 'var(--fab-fg)',
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
