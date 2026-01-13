import pool from '../db/pool.js';

// Store connected clients
const clients = new Map();

export default async function websocketHandler(connection, request) {
  console.log('New WebSocket connection');

  // Get user from token (simplified - in production, verify JWT properly)
  const token = request.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    connection.socket.close(1008, 'Unauthorized');
    return;
  }

  let userId;
  try {
    // In production, verify JWT token here
    // For now, we'll just store the connection
    userId = Date.now(); // Mock user ID
  } catch (error) {
    connection.socket.close(1008, 'Invalid token');
    return;
  }

  // Store client connection
  clients.set(userId, connection);

  // Handle messages from client
  connection.socket.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'subscribe-queue') {
        // Send initial queue data
        await sendQueueUpdate(connection, userId);
      } else if (data.type === 'unsubscribe-queue') {
        // Handle unsubscribe
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle disconnection
  connection.socket.on('close', () => {
    console.log('WebSocket disconnected');
    clients.delete(userId);
  });

  // Send initial connection confirmation
  connection.socket.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connected successfully',
  }));
}

// Function to send queue updates to clients
async function sendQueueUpdate(connection, userId) {
  try {
    // Get current queue
    const queueResult = await pool.query(
      `SELECT q.*, u.name as patient_name
       FROM queue q
       LEFT JOIN patients p ON q.patient_id = p.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE DATE(q.check_in_time) = CURRENT_DATE AND q.status IN ('waiting', 'in-progress')
       ORDER BY q.position ASC`
    );

    // Get user's position if they're a patient
    const positionResult = await pool.query(
      `SELECT q.position, q.estimated_wait_time
       FROM queue q
       JOIN patients p ON q.patient_id = p.id
       WHERE p.user_id = $1 AND DATE(q.check_in_time) = CURRENT_DATE AND q.status = 'waiting'`,
      [userId]
    );

    connection.socket.send(JSON.stringify({
      type: 'queue-update',
      queue: queueResult.rows,
      myPosition: positionResult.rows[0]?.position || null,
      estimatedWait: positionResult.rows[0]?.estimated_wait_time || 0,
    }));
  } catch (error) {
    console.error('Error sending queue update:', error);
  }
}

// Function to broadcast queue updates to all connected clients
export async function broadcastQueueUpdate() {
  for (const [userId, connection] of clients.entries()) {
    await sendQueueUpdate(connection, userId);
  }
}

// Set up periodic queue updates (every 5 seconds)
setInterval(() => {
  broadcastQueueUpdate();
}, 5000);

