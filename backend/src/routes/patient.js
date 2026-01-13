import pool from '../db/pool.js';

export default async function patientRoutes(fastify, options) {
  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // Get patient dashboard
  fastify.get('/dashboard', async (request, reply) => {
    try {
      const userId = request.user.id;

      // Get patient record
      const patientResult = await pool.query(
        'SELECT * FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patientResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }

      const patientId = patientResult.rows[0].id;

      // Get stats
      const stats = {
        totalVisits: 0,
        upcomingVisits: 0,
        prescriptions: 0,
      };

      const visitsResult = await pool.query(
        'SELECT COUNT(*) FROM visits WHERE patient_id = $1',
        [patientId]
      );
      stats.totalVisits = parseInt(visitsResult.rows[0].count);

      const upcomingResult = await pool.query(
        'SELECT COUNT(*) FROM appointments WHERE patient_id = $1 AND appointment_date > NOW() AND status = $2',
        [patientId, 'scheduled']
      );
      stats.upcomingVisits = parseInt(upcomingResult.rows[0].count);

      const prescriptionsResult = await pool.query(
        'SELECT COUNT(*) FROM prescriptions WHERE patient_id = $1',
        [patientId]
      );
      stats.prescriptions = parseInt(prescriptionsResult.rows[0].count);

      // Get upcoming visit
      const upcomingVisit = await pool.query(
        `SELECT a.*, u.name as doctor_name 
         FROM appointments a
         LEFT JOIN doctors d ON a.doctor_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE a.patient_id = $1 AND a.appointment_date > NOW() AND a.status = $2
         ORDER BY a.appointment_date ASC LIMIT 1`,
        [patientId, 'scheduled']
      );

      // Get recent visits
      const recentVisits = await pool.query(
        `SELECT v.*, u.name as doctor_name 
         FROM visits v
         LEFT JOIN doctors d ON v.doctor_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE v.patient_id = $1
         ORDER BY v.visit_date DESC LIMIT 5`,
        [patientId]
      );

      // Get queue position
      const queueResult = await pool.query(
        'SELECT position FROM queue WHERE patient_id = $1 AND status = $2',
        [patientId, 'waiting']
      );

      return {
        stats,
        upcomingVisit: upcomingVisit.rows[0] || null,
        recentVisits: recentVisits.rows,
        queuePosition: queueResult.rows[0]?.position || null,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load dashboard' });
    }
  });

  // Book appointment
  fastify.post('/book', async (request, reply) => {
    const { doctorId, date, notes } = request.body;
    const userId = request.user.id;

    try {
      // Get patient ID
      const patientResult = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patientResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }

      const patientId = patientResult.rows[0].id;

      // Create appointment
      const appointmentResult = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, notes, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [patientId, doctorId || null, date, notes || null, userId, 'scheduled']
      );

      return { appointment: appointmentResult.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to book appointment' });
    }
  });

  // Get queue status
  fastify.get('/queue', async (request, reply) => {
    try {
      const userId = request.user.id;

      // Get patient ID
      const patientResult = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patientResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }

      const patientId = patientResult.rows[0].id;

      // Get current queue
      const queueResult = await pool.query(
        `SELECT q.*, u.name as doctor_name
         FROM queue q
         LEFT JOIN doctors d ON q.doctor_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE DATE(q.check_in_time) = CURRENT_DATE
         ORDER BY q.position ASC`
      );

      // Get my position
      const myPosition = await pool.query(
        'SELECT position, estimated_wait_time FROM queue WHERE patient_id = $1 AND status = $2',
        [patientId, 'waiting']
      );

      return {
        queue: queueResult.rows,
        myPosition: myPosition.rows[0]?.position || null,
        estimatedWait: myPosition.rows[0]?.estimated_wait_time || 0,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get queue' });
    }
  });

  // Get prescriptions
  fastify.get('/prescriptions', async (request, reply) => {
    try {
      const userId = request.user.id;

      // Get patient ID
      const patientResult = await pool.query(
        'SELECT id FROM patients WHERE user_id = $1',
        [userId]
      );

      if (patientResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }

      const patientId = patientResult.rows[0].id;

      // Get prescriptions
      const prescriptionsResult = await pool.query(
        `SELECT p.*, u.name as doctor_name, d.specialization
         FROM prescriptions p
         LEFT JOIN doctors d ON p.doctor_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE p.patient_id = $1
         ORDER BY p.created_at DESC`,
        [patientId]
      );

      return { prescriptions: prescriptionsResult.rows };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get prescriptions' });
    }
  });
}

