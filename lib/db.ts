import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

// Fallback to local config if no DATABASE_URL (optional, or just rely on URL)
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not found, using legacy env vars if available");
  // @ts-ignore - Re-assigning config if needed, but cleaner to just use the URL logic primarily
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};
