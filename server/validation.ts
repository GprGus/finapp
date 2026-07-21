import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
  name: z.string().trim().max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().max(120),
});

const accountTypeSchema = z.enum(['Corrente', 'Poupança', 'Cartão', 'Investimento', 'Dinheiro']);

export const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: accountTypeSchema,
  openingBalance: z.number().finite(),
});

export const createGoalSchema = z.object({
  name: z.string().trim().min(1).max(120),
  target: z.number().finite(),
  current: z.number().finite(),
});

export const contributeToGoalSchema = z.object({
  amount: z.number().finite(),
});

export const createSubscriptionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.number().finite(),
  renewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hue: z.number().int().min(0).max(360),
});

const categoryIdSchema = z.enum([
  'moradia',
  'alimentacao',
  'transporte',
  'assinaturas',
  'lazer',
  'saude',
  'educacao',
  'outros',
  'renda',
]);

export const createEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  desc: z.string().trim().min(1).max(200),
  amount: z.number().finite(),
  categoryId: categoryIdSchema,
  accountId: z.string().uuid(),
});
