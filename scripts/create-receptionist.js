const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

const createReceptionist = async () => {
  try {
    const email = 'reception@vitapharm.com';
    const password = 'reception123';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Creating receptionist user...');

    // Check if exists
    const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (check.rows.length > 0) {
        console.log('Receptionist user already exists.');
        
        // Optional: Update password if you want to reset it always
        // await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, email]);
        // console.log('Password reset.');
    } else {
        await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
            ['Reception Desk', email, hashedPassword, 'receptionist']
        );
        console.log('Receptionist user created successfully.');
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating receptionist:', err);
    process.exit(1);
  }
};

createReceptionist();
