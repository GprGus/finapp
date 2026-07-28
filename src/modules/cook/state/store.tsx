import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/api';
import type { Recipe } from '../types';

interface CookContextValue {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  addRecipe: (data: Omit<Recipe, 'id' | 'createdAt'>) => Promise<void>;
  updateRecipe: (id: string, data: Omit<Recipe, 'id' | 'createdAt'>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
}

const CookContext = createContext<CookContextValue | null>(null);

export function CookProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Recipe[]>('/recipes')
      .then(setRecipes)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar receitas'))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<CookContextValue>(
    () => ({
      recipes,
      isLoading,
      error,
      addRecipe: async (data) => {
        const recipe = await apiFetch<Recipe>('/recipes', { method: 'POST', body: data });
        setRecipes((prev) => [recipe, ...prev]);
      },
      updateRecipe: async (id, data) => {
        const recipe = await apiFetch<Recipe>(`/recipes/${id}`, { method: 'PATCH', body: data });
        setRecipes((prev) => prev.map((r) => (r.id === id ? recipe : r)));
      },
      deleteRecipe: async (id) => {
        await apiFetch(`/recipes/${id}`, { method: 'DELETE' });
        setRecipes((prev) => prev.filter((r) => r.id !== id));
      },
    }),
    [recipes, isLoading, error],
  );

  return <CookContext.Provider value={value}>{children}</CookContext.Provider>;
}

export function useCook(): CookContextValue {
  const ctx = useContext(CookContext);
  if (!ctx) throw new Error('useCook must be used within CookProvider');
  return ctx;
}
