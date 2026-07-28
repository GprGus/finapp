export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number | null;
  prepMinutes: number | null;
  ingredients: Ingredient[];
  steps: string[];
  hue: number;
  createdAt: string;
}
