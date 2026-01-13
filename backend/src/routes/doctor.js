import pool from '../db/pool.js';

export default async function doctorRoutes(fastify, options) {
  // All routes require doctor role
  fastify.addHook('onRequest', fastify.authorize(['doctor', 'admin']));

  // Get dashboard
  fastify.get('/dashboard', async (request, reply) => {
    try {
      const userId = request.user.id;

      // Get doctor ID
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1',
        [userId]
      );

      if (doctorResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Doctor not found' });
      }

      const doctorId = doctorResult.rows[0].id;

      // Get stats
      const todayPatients = await pool.query(
        `SELECT COUNT(*) FROM appointments 
         WHERE doctor_id = $1 AND DATE(appointment_date) = CURRENT_DATE`,
        [doctorId]
      );

      const inQueue = await pool.query(
        `SELECT COUNT(*) FROM queue 
         WHERE doctor_id = $1 AND DATE(check_in_time) = CURRENT_DATE AND status IN ('waiting', 'in-progress')`,
        [doctorId]
      );

      const completed = await pool.query(
        `SELECT COUNT(*) FROM queue 
         WHERE doctor_id = $1 AND DATE(check_in_time) = CURRENT_DATE AND status = 'completed'`,
        [doctorId]
      );

      // Get current patient (in-progress)
      const currentPatient = await pool.query(
        `SELECT q.*, u.name, u.email, p.date_of_birth, p.gender
         FROM queue q
         JOIN patients p ON q.patient_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE q.doctor_id = $1 AND q.status = 'in-progress'
         LIMIT 1`,
        [doctorId]
      );

      // Get today's schedule
      const schedule = await pool.query(
        `SELECT a.*, u.name as patient_name, 
                CASE WHEN q.status = 'completed' THEN true ELSE false END as completed
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN users u ON p.user_id = u.id
         LEFT JOIN queue q ON q.appointment_id = a.id
         WHERE a.doctor_id = $1 AND DATE(a.appointment_date) = CURRENT_DATE
         ORDER BY a.appointment_date ASC`,
        [doctorId]
      );

      return {
        stats: {
          todayPatients: parseInt(todayPatients.rows[0].count),
          inQueue: parseInt(inQueue.rows[0].count),
          completed: parseInt(completed.rows[0].count),
          avgTime: 15, // Mock data
        },
        currentPatient: currentPatient.rows[0] || null,
        schedule: schedule.rows,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load dashboard' });
    }
  });

  // Get patient records
  fastify.get('/patients/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      // Get patient info
      const patientResult = await pool.query(
        `SELECT u.*, p.*
         FROM patients p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = $1`,
        [id]
      );

      if (patientResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }

      // Get visits
      const visitsResult = await pool.query(
        `SELECT v.*, u.name as doctor_name
         FROM visits v
         LEFT JOIN doctors d ON v.doctor_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE v.patient_id = $1
         ORDER BY v.visit_date DESC`,
        [id]
      );

      // Get prescriptions
      const prescriptionsResult = await pool.query(
        `SELECT p.*, u.name as doctor_name
         FROM prescriptions p
         LEFT JOIN doctors d ON p.doctor_id = d.id
         LEFT JOIN users u ON d.user_id = u.id
         WHERE p.patient_id = $1
         ORDER BY p.created_at DESC`,
        [id]
      );

      return {
        ...patientResult.rows[0],
        visits: visitsResult.rows,
        prescriptions: prescriptionsResult.rows,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get patient records' });
    }
  });

  // Create prescription
  fastify.post('/prescriptions', async (request, reply) => {
    const { patientEmail, medications, notes } = request.body;
    const userId = request.user.id;

    try {
      // Get doctor ID
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1',
        [userId]
      );

      if (doctorResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Doctor not found' });
      }

      const doctorId = doctorResult.rows[0].id;

      // Get patient ID
      const patientResult = await pool.query(
        `SELECT p.id FROM patients p
         JOIN users u ON p.user_id = u.id
         WHERE u.email = $1`,
        [patientEmail]
      );

      if (patientResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }

      const patientId = patientResult.rows[0].id;

      // Create visit if doesn't exist
      const visitResult = await pool.query(
        `INSERT INTO visits (patient_id, doctor_id, status)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [patientId, doctorId, 'completed']
      );

      const visitId = visitResult.rows[0].id;

      // Create prescription
      const prescriptionResult = await pool.query(
        `INSERT INTO prescriptions (visit_id, patient_id, doctor_id, medications, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [visitId, patientId, doctorId, JSON.stringify(medications), notes, userId]
      );

      return { prescription: prescriptionResult.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create prescription' });
    }
  });

  // Call next patient
  fastify.post('/queue/next', async (request, reply) => {
    const userId = request.user.id;

    try {
      // Get doctor ID
      const doctorResult = await pool.query(
        'SELECT id FROM doctors WHERE user_id = $1',
        [userId]
      );

      if (doctorResult.rows.length === 0) {
        return reply.code(404).send({ error: 'Doctor not found' });
      }

      const doctorId = doctorResult.rows[0].id;

      // Get next patient in queue
      const nextPatient = await pool.query(
        `SELECT * FROM queue 
         WHERE doctor_id = $1 AND DATE(check_in_time) = CURRENT_DATE AND status = 'waiting'
         ORDER BY position ASC
         LIMIT 1`,
        [doctorId]
      );

      if (nextPatient.rows.length === 0) {
        return reply.code(404).send({ error: 'No patients in queue' });
      }

      // Update status to in-progress
      await pool.query(
        `UPDATE queue 
         SET status = 'in-progress', start_time = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [nextPatient.rows[0].id]
      );

      return { message: 'Next patient called', patient: nextPatient.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to call next patient' });
    }
  });

  // Get/Update schedule
  fastify.get('/schedule', async (request, reply) => {
    try {
      const userId = request.user.id;

      const doctorResult = await pool.query(
        'SELECT availability FROM doctors WHERE user_id = $1',
        [userId]
      );

      return { availability: doctorResult.rows[0]?.availability || {} };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get schedule' });
    }
  });

  fastify.put('/schedule', async (request, reply) => {
    const { availability } = request.body;
    const userId = request.user.id;

    try {
      await pool.query(
        'UPDATE doctors SET availability = $1, updated_at = NOW() WHERE user_id = $2',
        [JSON.stringify(availability), userId]
      );

      return { message: 'Schedule updated successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update schedule' });
    }
  });
}

