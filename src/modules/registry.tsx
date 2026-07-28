import type { ReactNode } from 'react';

export interface ModuleDef {
  id: string;
  name: string;
  description: string;
  path: string;
  hue: number;
  icon: (color: string) => ReactNode;
}

// Each module is a self-contained sub-app under src/modules/<id>/, mounted at `path` from
// App.tsx's router. Adding a module here (and a matching <Route> in App.tsx) is the only
// wiring needed — a module never imports from another module's internals.
export const MODULES: ModuleDef[] = [
  {
    id: 'finapp',
    name: 'FinApp',
    description: 'Contas, lançamentos, assinaturas e dívidas',
    path: '/finapp',
    hue: 152,
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="6" width="19" height="13" rx="3" stroke={color} strokeWidth="1.8" />
        <path d="M2.5 10h19" stroke={color} strokeWidth="1.8" />
        <circle cx="17" cy="14.5" r="1.6" fill={color} />
      </svg>
    ),
  },
];
