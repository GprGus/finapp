import type { Category, CategoryId } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'moradia', name: 'Moradia', hue: 40 },
  { id: 'alimentacao', name: 'Alimentação', hue: 140 },
  { id: 'transporte', name: 'Transporte', hue: 250 },
  { id: 'assinaturas', name: 'Assinaturas', hue: 300 },
  { id: 'lazer', name: 'Lazer', hue: 20 },
  { id: 'saude', name: 'Saúde', hue: 10 },
  { id: 'educacao', name: 'Educação', hue: 220 },
  { id: 'outros', name: 'Outros', hue: 90 },
  { id: 'renda', name: 'Renda', hue: 152 },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'renda');

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function categoryDotColor(hue: number): string {
  return `oklch(0.6 0.08 ${hue})`;
}

export function categoryBarColor(hue: number): string {
  return `oklch(0.5 0.11 ${hue})`;
}
