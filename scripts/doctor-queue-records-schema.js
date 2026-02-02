/**
 * Migration: Doctor queue assignment + record author + structured form.
 * - queue: provider_id (doctor assigned), status can be 'in_consultation'
 * - patient_records: author_id, form_data (JSONB) for structured consultation
 */
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

const run = async () => {
  try {
    console.log('Applying doctor/queue/records schema updates...');

    // Queue: add provider_id (doctor assigned to this queue entry)
    await pool.query(`
      ALTER TABLE queue
      ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES users(id);
    `);
    console.log('queue.provider_id added.');

    // Ensure status can be in_consultation (no constraint change needed if status is varchar)
    // patient_records: author_id
    await pool.query(`
      ALTER TABLE patient_records
      ADD COLUMN IF NOT EXISTS author_id INTEGER REFERENCES users(id);
    `);
    console.log('patient_records.author_id added.');

    // patient_records: form_data for structured consultation (findings, recommendations, etc.)
    await pool.query(`
      ALTER TABLE patient_records
      ADD COLUMN IF NOT EXISTS form_data JSONB;
    `);
    console.log('patient_records.form_data added.');

    // appointments: provider_id (doctor assigned)
    await pool.query(`
      ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS provider_id INTEGER REFERENCES users(id);
    `);
    console.log('appointments.provider_id added.');

    console.log('Schema update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();
