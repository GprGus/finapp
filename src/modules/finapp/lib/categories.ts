import type { CSSProperties } from 'react';
import type { Category, CategoryId } from '../types';
import type { Theme } from '@/state/theme';

export const CATEGORIES: Category[] = [
  { id: 'moradia', name: 'Moradia', hue: 40 },
  { id: 'alimentacao', name: 'Alimentação', hue: 140 },
  { id: 'transporte', name: 'Transporte', hue: 250 },
  { id: 'assinaturas', name: 'Assinaturas', hue: 300 },
  { id: 'lazer', name: 'Lazer', hue: 20 },
  { id: 'saude', name: 'Saúde', hue: 10 },
  { id: 'educacao', name: 'Educação', hue: 220 },
  { id: 'dividas', name: 'Dívidas', hue: 0 },
  { id: 'outros', name: 'Outros', hue: 90 },
  { id: 'renda', name: 'Renda', hue: 152 },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'renda');

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function categoryDotColor(hue: number): string {
  return `oklch(var(--hue-dot-l) var(--hue-dot-c) ${hue})`;
}

export function categoryBarColor(hue: number): string {
  return `oklch(var(--hue-bar-l) var(--hue-bar-c) ${hue})`;
}

// Subscription/debt avatar circle: a solid saturated color with a plain white letter in light
// mode, but a softer tinted/bordered badge in dark mode (a flat white letter would look out of
// place against Nocturne's muted palette) — this shape difference needs the current theme, unlike
// the CSS-var-only dot/bar colors above.
export function avatarTileStyle(hue: number, theme: Theme): CSSProperties {
  if (theme === 'dark') {
    return {
      background: `oklch(0.32 0.05 ${hue})`,
      border: `1px solid oklch(0.45 0.06 ${hue})`,
      color: `oklch(0.85 0.06 ${hue})`,
    };
  }
  return {
    background: `oklch(0.55 0.1 ${hue})`,
    border: 'none',
    color: '#fff',
  };
}
