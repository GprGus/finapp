import type { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME, verifyToken } from './jwt.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  const userId = token ? verifyToken(token) : null;

  if (!userId) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }

  req.userId = userId;
  next();
}
