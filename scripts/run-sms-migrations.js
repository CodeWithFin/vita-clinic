/**
 * Run SMS migrations (003_sms_system.sql, 004_sms_same_day_and_templates.sql).
 * Requires: DATABASE_URL in .env. Run after 001_clients.sql (clients table must exist).
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
  }
  const migrations = ['003_sms_system.sql', '004_sms_same_day_and_templates.sql'];
  for (const name of migrations) {
    const sqlPath = path.join(__dirname, '../db/migrations', name);
    if (!fs.existsSync(sqlPath)) {
      console.warn('Skip (not found):', name);
      continue;
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');
    try {
      await pool.query(sql);
      console.log('Applied:', name);
    } catch (err) {
      console.error('Error applying', name, err.message);
      process.exit(1);
    }
  }
  await pool.end();
  console.log('SMS migrations done.');
}

run();
