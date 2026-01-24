const db = require('./index');
const fs = require('fs');
const path = require('path');

const initDb = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await db.query(sql);
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database', err);
    process.exit(1);
  }
};

initDb();
