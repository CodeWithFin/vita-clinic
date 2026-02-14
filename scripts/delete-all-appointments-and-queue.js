/**
 * Delete all appointments and all queue entries so the reception desk is empty.
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
    const queueResult = await pool.query('DELETE FROM queue');
    const apptResult = await pool.query('DELETE FROM appointments');
    console.log('Deleted', queueResult.rowCount ?? 0, 'queue entry(ies).');
    console.log('Deleted', apptResult.rowCount ?? 0, 'appointment(s).');
    console.log('Reception desk is now empty.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
