import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCook } from './state/store';
import { ConfirmDeleteSheet } from '@/components/ConfirmDeleteSheet';
import { AddRecipeSheet } from './components/AddRecipeSheet';
import { Recipes } from './pages/Recipes';
import { RecipeDetail } from './pages/RecipeDetail';
import type { Recipe } from './types';

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
  const { recipes, isLoading, error, deleteRecipe } = useCook();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [target, setTarget] = useState<Recipe | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface max-w-[560px] mx-auto flex items-center justify-center font-sans box-border">
        <div className="text-ink/40 text-sm">Carregando…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface max-w-[560px] mx-auto flex items-center justify-center font-sans box-border px-6 text-center">
        <div className="text-[13.5px]" style={{ color: 'var(--warning-color)' }}>
          {error}
        </div>
      </div>
    );
  }

  const selectedRecipe = recipes.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-surface max-w-[560px] mx-auto relative font-sans box-border shadow-[0_0_60px_rgba(20,20,15,0.06)]">
      {selectedRecipe ? (
        <RecipeDetail
          recipe={selectedRecipe}
          onBack={() => setSelectedId(null)}
          onEdit={() => setEditing(selectedRecipe)}
        />
      ) : (
        <>
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

          <Recipes onSelectRecipe={(recipe) => setSelectedId(recipe.id)} onAdd={() => setShowAdd(true)} />
        </>
      )}

      <AddRecipeSheet
        open={showAdd || !!editing}
        editing={editing}
        onClose={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        onRequestDelete={(recipe) => {
          setEditing(null);
          setTarget(recipe);
        }}
      />

      <ConfirmDeleteSheet
        open={!!target}
        title={`Excluir "${target?.name}"?`}
        onConfirm={async () => {
          if (target) {
            await deleteRecipe(target.id);
            setTarget(null);
            setSelectedId(null);
          }
        }}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
