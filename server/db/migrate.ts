import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runMigrations() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const migrationClient = postgres(DATABASE_URL, { max: 1 });
    try {
      await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' });
      return;
    } catch (err) {
      if (attempt === MAX_ATTEMPTS) throw err;
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Migration attempt ${attempt}/${MAX_ATTEMPTS} failed (${message}), retrying in ${RETRY_DELAY_MS}ms…`);
      await sleep(RETRY_DELAY_MS);
    } finally {
      await migrationClient.end({ timeout: 1 });
    }
  }
}
