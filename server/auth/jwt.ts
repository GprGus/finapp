import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';

const JWT_SECRET: string = (() => {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET is not set');
  return value;
})();

const EXPIRES_IN_SECONDS = 30 * 24 * 60 * 60; // 30 days

export const AUTH_COOKIE_NAME = 'token';

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: EXPIRES_IN_SECONDS * 1000,
  path: '/',
};

interface TokenPayload {
  sub: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies TokenPayload, JWT_SECRET, { expiresIn: EXPIRES_IN_SECONDS });
}

export function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload.sub;
  } catch {
    return null;
  }
}
