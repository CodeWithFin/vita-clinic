/**
 * Delete all client records: clear client_id from appointments, queue, patient_records, then delete all rows from clients.
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

async function run() {
  try {
    await pool.query('UPDATE appointments SET client_id = NULL WHERE client_id IS NOT NULL');
    const a = await pool.query('UPDATE queue SET client_id = NULL WHERE client_id IS NOT NULL');
    await pool.query('UPDATE patient_records SET client_id = NULL WHERE client_id IS NOT NULL');
    const del = await pool.query('DELETE FROM clients');
    console.log('Cleared client_id from appointments, queue, and patient_records.');
    console.log('Deleted', del.rowCount ?? 0, 'client record(s).');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
