/**
 * Run clients migration (001_clients.sql) then backfill client_id from existing users.
 * Requires: db/init.sql and patient_records table (run create-records-table.js and doctor-queue-records-schema.js first).
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

async function runMigration() {
  const sqlPath = path.join(__dirname, '../db/migrations/001_clients.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await pool.query(sql);
  console.log('001_clients.sql applied.');
}

async function backfill() {
  // Get distinct user_ids from appointments, queue, patient_records that don't have a client yet
  const { rows: appointmentUserIds } = await pool.query(`
    SELECT DISTINCT a.user_id FROM appointments a
    WHERE a.user_id IS NOT NULL AND (a.client_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = a.client_id))
  `);
  const { rows: queueUserIds } = await pool.query(`
    SELECT DISTINCT q.user_id FROM queue q
    WHERE q.user_id IS NOT NULL AND (q.client_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = q.client_id))
  `);
  const { rows: recordUserIds } = await pool.query(`
    SELECT DISTINCT pr.user_id FROM patient_records pr
    WHERE pr.user_id IS NOT NULL AND (pr.client_id IS NULL OR NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = pr.client_id))
  `);

  const allUserIds = [...new Set([
    ...appointmentUserIds.map(r => r.user_id),
    ...queueUserIds.map(r => r.user_id),
    ...recordUserIds.map(r => r.user_id),
  ].filter(Boolean))];

  if (allUserIds.length === 0) {
    console.log('No users to backfill.');
    return;
  }

  const { rows: users } = await pool.query(
    'SELECT id, name, email, phone FROM users WHERE id = ANY($1)',
    [allUserIds]
  );

  for (const u of users) {
    const existing = await pool.query('SELECT id FROM clients WHERE phone = $1 LIMIT 1', [u.phone || '']);
    let clientIdRow;
    if (existing.rows.length > 0) {
      clientIdRow = existing.rows[0];
    } else {
      const ins = await pool.query(
        `INSERT INTO clients (name, phone, email, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING id`,
        [u.name || 'Unknown', u.phone || null, u.email || null]
      );
      clientIdRow = ins.rows[0];
      // client_id is auto-set by trigger
    }
    const cid = clientIdRow.id;
    await pool.query('UPDATE appointments SET client_id = $1 WHERE user_id = $2', [cid, u.id]);
    await pool.query('UPDATE queue SET client_id = $1 WHERE user_id = $2', [cid, u.id]);
    await pool.query('UPDATE patient_records SET client_id = $1 WHERE user_id = $2', [cid, u.id]);
  }
  console.log('Backfill complete for', users.length, 'users.');
}

async function main() {
  try {
    await runMigration();
    await backfill();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
