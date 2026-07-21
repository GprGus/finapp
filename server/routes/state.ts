import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { accounts, entries, goals, subscriptions } from '../db/schema.js';
import { requireAuth } from '../auth/middleware.js';

export const stateRouter = Router();
stateRouter.use(requireAuth);

stateRouter.get('/', async (req, res) => {
  const userId = req.userId!;

  const [userAccounts, userGoals, userSubscriptions, userEntries] = await Promise.all([
    db.query.accounts.findMany({ where: eq(accounts.userId, userId) }),
    db.query.goals.findMany({ where: eq(goals.userId, userId) }),
    db.query.subscriptions.findMany({ where: eq(subscriptions.userId, userId) }),
    db.query.entries.findMany({ where: eq(entries.userId, userId) }),
  ]);

  res.json({ accounts: userAccounts, goals: userGoals, subscriptions: userSubscriptions, entries: userEntries });
});
