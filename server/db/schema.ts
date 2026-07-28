import { boolean, date, index, integer, jsonb, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    type: text('type').notNull(),
    openingBalance: numeric('opening_balance', { mode: 'number', precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('accounts_user_id_idx').on(t.userId)],
);

export const goals = pgTable(
  'goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    current: numeric('current', { mode: 'number', precision: 14, scale: 2 }).notNull(),
    target: numeric('target', { mode: 'number', precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('goals_user_id_idx').on(t.userId)],
);

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    price: numeric('price', { mode: 'number', precision: 14, scale: 2 }).notNull(),
    cadence: text('cadence').notNull().default('interval'), // 'interval' | 'monthly'
    intervalDays: integer('interval_days').notNull().default(30),
    billingDay: integer('billing_day'),
    nextChargeDate: date('renew_date').notNull(),
    lastChargeDate: date('last_charge_date'),
    isRecurring: boolean('is_recurring').notNull().default(true),
    endDate: date('end_date'),
    hue: integer('hue').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('subscriptions_user_id_idx').on(t.userId),
    index('subscriptions_account_id_idx').on(t.accountId),
  ],
);

export const debts = pgTable(
  'debts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    installmentAmount: numeric('installment_amount', { mode: 'number', precision: 14, scale: 2 }).notNull(),
    totalInstallments: integer('total_installments').notNull(),
    paidInstallments: integer('paid_installments').notNull().default(0),
    cadence: text('cadence').notNull().default('interval'), // 'interval' | 'monthly'
    intervalDays: integer('interval_days').notNull().default(30),
    billingDay: integer('billing_day'),
    nextChargeDate: date('next_charge_date').notNull(),
    lastChargeDate: date('last_charge_date'),
    hue: integer('hue').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('debts_user_id_idx').on(t.userId),
    index('debts_account_id_idx').on(t.accountId),
  ],
);

export const friendRequests = pgTable(
  'friend_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    requesterId: uuid('requester_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    addresseeId: uuid('addressee_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('pending'), // 'pending' | 'accepted' (declined/cancelled rows are deleted, not statused)
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('friend_requests_requester_id_idx').on(t.requesterId),
    index('friend_requests_addressee_id_idx').on(t.addresseeId),
  ],
);

export const agendaEvents = pgTable(
  'agenda_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    notes: text('notes'),
    date: date('date').notNull(),
    time: text('time'),
    sharedFromUserId: uuid('shared_from_user_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('agenda_events_user_id_idx').on(t.userId), index('agenda_events_date_idx').on(t.date)],
);

export const agendaEventShares = pgTable(
  'agenda_event_shares',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').notNull().references(() => agendaEvents.id, { onDelete: 'cascade' }),
    fromUserId: uuid('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    toUserId: uuid('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('pending'), // 'pending' | 'accepted' (declined rows are deleted)
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('agenda_event_shares_to_user_id_idx').on(t.toUserId),
    index('agenda_event_shares_event_id_idx').on(t.eventId),
  ],
);

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    servings: integer('servings'),
    prepMinutes: integer('prep_minutes'),
    ingredients: jsonb('ingredients').notNull(), // Ingredient[] — see src/modules/cook/types.ts
    steps: jsonb('steps').notNull(), // string[]
    hue: integer('hue').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('recipes_user_id_idx').on(t.userId)],
);

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull().default(''),
    contentHtml: text('content_html').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('notes_user_id_idx').on(t.userId)],
);

export const entries = pgTable(
  'entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
    debtId: uuid('debt_id').references(() => debts.id, { onDelete: 'set null' }),
    date: date('date').notNull(),
    desc: text('desc').notNull(),
    amount: numeric('amount', { mode: 'number', precision: 14, scale: 2 }).notNull(),
    categoryId: text('category_id').notNull(),
    retro: boolean('retro').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('entries_user_id_idx').on(t.userId),
    index('entries_account_id_idx').on(t.accountId),
    index('entries_date_idx').on(t.date),
  ],
);
