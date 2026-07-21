import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../auth/hash.js';
import { AUTH_COOKIE_NAME, authCookieOptions, signToken } from '../auth/jwt.js';
import { requireAuth } from '../auth/middleware.js';
import { loginSchema, registerSchema, updateProfileSchema } from '../validation.js';

export const authRouter = Router();

function publicUser(user: { id: string; email: string; name: string }) {
  return { id: user.id, email: user.email, name: user.name };
}

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
  const { email, password, name } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    res.status(409).json({ error: 'E-mail já cadastrado' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name: name ?? '' })
    .returning();

  const token = signToken(user.id);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.status(201).json(publicUser(user));
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: 'E-mail ou senha inválidos' });
    return;
  }

  const token = signToken(user.id);
  res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
  res.json(publicUser(user));
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: authCookieOptions.httpOnly,
    sameSite: authCookieOptions.sameSite,
    secure: authCookieOptions.secure,
    path: authCookieOptions.path,
  });
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, req.userId!) });
  if (!user) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }
  res.json(publicUser(user));
});

authRouter.patch('/me', requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos' });
    return;
  }

  const [user] = await db
    .update(users)
    .set({ name: parsed.data.name })
    .where(eq(users.id, req.userId!))
    .returning();

  res.json(publicUser(user));
});
