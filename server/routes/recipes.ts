import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { recipes } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { createRecipeSchema } from '../validation.js';

export const recipesRouter = Router();
recipesRouter.use(requireAuth);

recipesRouter.get('/', async (req, res) => {
  const rows = await db.query.recipes.findMany({ where: eq(recipes.userId, req.userId!) });
  res.json(rows);
});

recipesRouter.post('/', async (req, res) => {
  const parsed = createRecipeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [recipe] = await db
    .insert(recipes)
    .values({ ...parsed.data, userId: req.userId! })
    .returning();

  res.status(201).json(recipe);
});

recipesRouter.patch('/:id', async (req, res) => {
  const parsed = createRecipeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [recipe] = await db
    .update(recipes)
    .set(parsed.data)
    .where(and(eq(recipes.id, req.params.id), eq(recipes.userId, req.userId!)))
    .returning();

  if (!recipe) {
    res.status(404).json({ error: 'Receita não encontrada' });
    return;
  }

  res.json(recipe);
});

recipesRouter.delete('/:id', async (req, res) => {
  const [deleted] = await db
    .delete(recipes)
    .where(and(eq(recipes.id, req.params.id), eq(recipes.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Receita não encontrada' });
    return;
  }

  res.status(204).end();
});
