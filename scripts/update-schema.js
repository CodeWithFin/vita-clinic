const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

const updateSchema = async () => {
  try {
    console.log('Connecting to database...');
    
    // Add phone column if it doesn't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    `);
    console.log('Added phone column.');

    // Make email nullable
    await pool.query(`
      ALTER TABLE users 
      ALTER COLUMN email DROP NOT NULL;
    `);
    console.log('Made email nullable.');
    
    // Remove email unique constraint if needed (strictly speaking, nulls are unique-ish, but let's leave the constraint alone for now unless it blocks us.
    // Actually, distinct nulls allow multiple nulls in standard SQL.
    // But we might want phone to be unique for lookup.
    
    // Attempt to add unique constraint to phone. This might fail if duplicates exist, but we cover basic case.
    try {
        await pool.query(`
            ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone);
        `);
        console.log('Added unique constraint to phone.');
    } catch (e) {
        console.log('Unique constraint on phone might already exist or data conflict:', e.message);
    }

    console.log('Database schema updated successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating database:', err);
    process.exit(1);
  }
};

updateSchema();
