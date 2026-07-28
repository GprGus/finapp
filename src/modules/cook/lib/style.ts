import type { CSSProperties } from 'react';
import type { Theme } from '@/state/theme';

// Recipe avatar tile: same solid-vs-tinted-badge shape difference as FinApp's avatarTileStyle,
// duplicated here rather than shared since Cook's tile is its own thing (no shared category
// concept with FinApp) — see CLAUDE.md's module-isolation convention.
export function recipeTileStyle(hue: number, theme: Theme): CSSProperties {
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
