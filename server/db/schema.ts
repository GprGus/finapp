import { boolean, date, index, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
    intervalDays: integer('interval_days').notNull().default(30),
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

export const entries = pgTable(
  'entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id').notNull().references(() => accounts.id, { onDelete: 'cascade' }),
    subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'set null' }),
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
