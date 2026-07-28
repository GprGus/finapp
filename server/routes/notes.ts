import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { notes } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';
import { updateNoteSchema } from '../validation.js';

export const notesRouter = Router();
notesRouter.use(requireAuth);

notesRouter.get('/', async (req, res) => {
  const rows = await db.query.notes.findMany({ where: eq(notes.userId, req.userId!) });
  res.json(rows);
});

// Always creates a blank note — the client navigates straight into the editor and PATCHes as the
// user types, mirroring the client-only version's addNote()/updateNote() split.
notesRouter.post('/', async (req, res) => {
  const [note] = await db
    .insert(notes)
    .values({ userId: req.userId! })
    .returning();

  res.status(201).json(note);
});

notesRouter.patch('/:id', async (req, res) => {
  const parsed = updateNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [note] = await db
    .update(notes)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.userId!)))
    .returning();

  if (!note) {
    res.status(404).json({ error: 'Nota não encontrada' });
    return;
  }

  res.json(note);
});

notesRouter.delete('/:id', async (req, res) => {
  const [deleted] = await db
    .delete(notes)
    .where(and(eq(notes.id, req.params.id), eq(notes.userId, req.userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: 'Nota não encontrada' });
    return;
  }

  res.status(204).end();
});
