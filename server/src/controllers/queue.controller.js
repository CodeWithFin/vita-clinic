const db = require('../db');

exports.joinQueue = async (req, res) => {
  const { userId } = req.body; // In real app, get from req.user (auth middleware)

  try {
    // Basic ticket generation logic (Timestamp or increment)
    // For MVP, using simple random string or auto-increment ID from DB
    const ticketNumber = 'A-' + Math.floor(Math.random() * 1000);

    const result = await db.query(
      'INSERT INTO queue (user_id, ticket_number, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, ticketNumber, 'waiting']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM queue WHERE status = $1 ORDER BY created_at ASC', ['waiting']);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
