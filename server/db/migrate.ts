import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export async function runMigrations() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const migrationClient = postgres(DATABASE_URL, { max: 1 });
  try {
    await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' });
  } finally {
    await migrationClient.end();
  }
}
