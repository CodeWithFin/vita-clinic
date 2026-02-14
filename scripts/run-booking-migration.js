/**
 * Apply booking enhancements migration (002).
 * Requires: clients table (run run-clients-migration.js first if using waiting_list).
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
  try {
    const sqlPath = path.join(__dirname, '../db/migrations/002_booking_enhancements.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('002_booking_enhancements.sql applied.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
