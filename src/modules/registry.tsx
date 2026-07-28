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
  {
    id: 'cook',
    name: 'Cook',
    description: 'Receitas, ingredientes e modo de preparo',
    path: '/cook',
    hue: 45,
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 2c0 1-1.4 1-1.4 2.2S9 5.4 9 6.6M13.5 2c0 1-1.4 1-1.4 2.2s1.4 1.2 1.4 2.4"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M3 12h-1.3M22.3 12H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path
          d="M3.5 10.5h17v5.5a5 5 0 01-5 5h-7a5 5 0 01-5-5v-5.5z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M3.5 10.5h17" stroke={color} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Bloco de notas com formatação e imagens',
    path: '/notes',
    hue: 210,
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="12" height="18" rx="2" stroke={color} strokeWidth="1.8" />
        <path d="M4.5 7.5h7M4.5 11h7M4.5 14.5h4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M21.5 3.8a1.9 1.9 0 00-2.7 0L14 8.6l-1 4 4-1 4.8-4.8a1.9 1.9 0 000-2.7l-.3-.3z"
          stroke={color}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'agenda',
    name: 'Agenda',
    description: 'Compromissos por mês, com títulos e horários',
    path: '/agenda',
    hue: 280,
    icon: (color) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="2.5" y="4.5" width="19" height="17" rx="3" stroke={color} strokeWidth="1.8" />
        <path d="M2.5 9.5h19" stroke={color} strokeWidth="1.8" />
        <path d="M7 2.5v4M17 2.5v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <rect x="6" y="12.5" width="3" height="3" rx="0.8" fill={color} />
        <rect x="10.5" y="12.5" width="3" height="3" rx="0.8" fill={color} />
      </svg>
    ),
  },
];
