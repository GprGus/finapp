import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Recipe } from '../types';

const STORAGE_KEY = 'cook.recipes';

function loadRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

interface CookContextValue {
  recipes: Recipe[];
  addRecipe: (data: Omit<Recipe, 'id' | 'createdAt'>) => Recipe;
  updateRecipe: (id: string, data: Omit<Recipe, 'id' | 'createdAt'>) => void;
  deleteRecipe: (id: string) => void;
}

const CookContext = createContext<CookContextValue | null>(null);

export function CookProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  const value = useMemo<CookContextValue>(
    () => ({
      recipes,
      addRecipe: (data) => {
        const recipe: Recipe = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        setRecipes((prev) => [recipe, ...prev]);
        return recipe;
      },
      updateRecipe: (id, data) => {
        setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
      },
      deleteRecipe: (id) => {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
      },
    }),
    [recipes],
  );

  return <CookContext.Provider value={value}>{children}</CookContext.Provider>;
}

export function useCook(): CookContextValue {
  const ctx = useContext(CookContext);
  if (!ctx) throw new Error('useCook must be used within CookProvider');
  return ctx;
}
