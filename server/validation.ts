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

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const cadenceSchema = z.enum(['interval', 'monthly']);

export const createSubscriptionSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    price: z.number().finite(),
    accountId: z.string().uuid(),
    cadence: cadenceSchema,
    intervalDays: z.number().int().min(1).max(3650),
    nextChargeDate: isoDateSchema,
    isRecurring: z.boolean(),
    endDate: isoDateSchema.nullable().optional(),
    hue: z.number().int().min(0).max(360),
    chargeNow: z.boolean().optional(),
  })
  .refine((data) => data.isRecurring || !!data.endDate, {
    message: 'Data de término é obrigatória para assinaturas com término',
    path: ['endDate'],
  });

export const updateSubscriptionSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    price: z.number().finite(),
    accountId: z.string().uuid(),
    cadence: cadenceSchema,
    intervalDays: z.number().int().min(1).max(3650),
    nextChargeDate: isoDateSchema,
    isRecurring: z.boolean(),
    endDate: isoDateSchema.nullable().optional(),
    hue: z.number().int().min(0).max(360),
  })
  .refine((data) => data.isRecurring || !!data.endDate, {
    message: 'Data de término é obrigatória para assinaturas com término',
    path: ['endDate'],
  });

export const createDebtSchema = z.object({
  name: z.string().trim().min(1).max(120),
  accountId: z.string().uuid(),
  installmentAmount: z.number().finite().positive(),
  totalInstallments: z.number().int().min(1).max(600),
  cadence: cadenceSchema,
  intervalDays: z.number().int().min(1).max(3650),
  nextChargeDate: isoDateSchema,
  hue: z.number().int().min(0).max(360),
  chargeNow: z.boolean().optional(),
});

export const updateDebtSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    accountId: z.string().uuid(),
    installmentAmount: z.number().finite().positive(),
    totalInstallments: z.number().int().min(1).max(600),
    paidInstallments: z.number().int().min(0),
    cadence: cadenceSchema,
    intervalDays: z.number().int().min(1).max(3650),
    nextChargeDate: isoDateSchema,
    hue: z.number().int().min(0).max(360),
  })
  .refine((data) => data.paidInstallments <= data.totalInstallments, {
    message: 'Parcelas pagas não pode ser maior que o total de parcelas',
    path: ['paidInstallments'],
  });

export const abateDebtSchema = z.object({
  amount: z.number().finite().positive(),
  installmentsAbated: z.number().int().positive(),
});

const categoryIdSchema = z.enum([
  'moradia',
  'alimentacao',
  'transporte',
  'assinaturas',
  'lazer',
  'saude',
  'educacao',
  'dividas',
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

export const createRecipeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  servings: z.number().int().positive().nullable().optional(),
  prepMinutes: z.number().int().positive().nullable().optional(),
  ingredients: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(120),
        quantity: z.string().trim().max(40),
        unit: z.string().trim().max(40),
      }),
    )
    .max(100),
  steps: z.array(z.string().trim().min(1).max(1000)).max(100),
  hue: z.number().int().min(0).max(360),
});

// Generous cap so a few inline base64 images fit — express.json()'s limit is bumped to match, see index.ts.
export const updateNoteSchema = z.object({
  title: z.string().trim().max(200).optional(),
  contentHtml: z.string().max(10_000_000).optional(),
});

export const sendFriendRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/)
  .nullable()
  .optional();

export const createAgendaEventSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000).nullable().optional(),
  date: isoDateSchema,
  time: timeSchema,
  shareWithFriendIds: z.array(z.string().uuid()).max(50).optional(),
});

export const updateAgendaEventSchema = z.object({
  title: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000).nullable().optional(),
  date: isoDateSchema,
  time: timeSchema,
});

export const shareAgendaEventSchema = z.object({
  friendIds: z.array(z.string().uuid()).min(1).max(50),
});
