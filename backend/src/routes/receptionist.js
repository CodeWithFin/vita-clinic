import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import { sendOTPEmail } from '../utils/email.js';
import { generateOTP, getOTPExpiryTime } from '../utils/otp.js';

export default async function receptionistRoutes(fastify, options) {
  // All routes require receptionist role
  fastify.addHook('onRequest', fastify.authorize(['receptionist', 'admin']));

  // Get dashboard data
  fastify.get('/dashboard', async (request, reply) => {
    try {
      // Get today's stats
      const queueCount = await pool.query(
        `SELECT COUNT(*) FROM queue 
         WHERE DATE(check_in_time) = CURRENT_DATE AND status IN ('waiting', 'in-progress')`
      );

      const appointmentsToday = await pool.query(
        `SELECT COUNT(*) FROM appointments 
         WHERE DATE(appointment_date) = CURRENT_DATE`
      );

      const completed = await pool.query(
        `SELECT COUNT(*) FROM queue 
         WHERE DATE(check_in_time) = CURRENT_DATE AND status = 'completed'`
      );

      const noShows = await pool.query(
        `SELECT COUNT(*) FROM queue 
         WHERE DATE(check_in_time) = CURRENT_DATE AND status = 'no-show'`
      );

      // Get upcoming appointments
      const upcomingAppointments = await pool.query(
        `SELECT a.*, u1.name as patient_name, u1.email as patient_email, u2.name as doctor_name
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN users u1 ON p.user_id = u1.id
         LEFT JOIN doctors d ON a.doctor_id = d.id
         LEFT JOIN users u2 ON d.user_id = u2.id
         WHERE DATE(a.appointment_date) = CURRENT_DATE
         ORDER BY a.appointment_date ASC`
      );

      return {
        stats: {
          queueCount: parseInt(queueCount.rows[0].count),
          appointmentsToday: parseInt(appointmentsToday.rows[0].count),
          completed: parseInt(completed.rows[0].count),
          noShows: parseInt(noShows.rows[0].count),
        },
        upcomingAppointments: upcomingAppointments.rows,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load dashboard' });
    }
  });

  // Register new patient
  fastify.post('/patients', async (request, reply) => {
    const { name, email, phone, dateOfBirth, gender, address } = request.body;

    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return reply.code(400).send({ error: 'Patient already exists' });
      }

      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, role, name, phone, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, role, name`,
        [email, 'patient', name, phone, true]
      );

      const userId = userResult.rows[0].id;

      // Create patient record
      await pool.query(
        `INSERT INTO patients (user_id, date_of_birth, gender, address)
         VALUES ($1, $2, $3, $4)`,
        [userId, dateOfBirth || null, gender || null, address || null]
      );

      // Send OTP to patient
      const otp = generateOTP();
      const expiresAt = getOTPExpiryTime();

      await pool.query(
        'INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)',
        [email, otp, expiresAt]
      );

      await sendOTPEmail(email, otp);

      return { message: 'Patient registered successfully', user: userResult.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to register patient' });
    }
  });

  // Search patient
  fastify.get('/patients/search', async (request, reply) => {
    const { email } = request.query;

    try {
      const result = await pool.query(
        `SELECT u.*, p.id as patient_id, p.date_of_birth, p.gender, p.address
         FROM users u
         JOIN patients p ON u.id = p.user_id
         WHERE u.email = $1 AND u.role = 'patient'`,
        [email]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Patient not found' });
      }

      return { patient: result.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to search patient' });
    }
  });

  // Get all bookings
  fastify.get('/bookings', async (request, reply) => {
    try {
      const bookingsResult = await pool.query(
        `SELECT a.*, u1.name as patient_name, u1.email as patient_email, u2.name as doctor_name
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN users u1 ON p.user_id = u1.id
         LEFT JOIN doctors d ON a.doctor_id = d.id
         LEFT JOIN users u2 ON d.user_id = u2.id
         WHERE a.appointment_date >= CURRENT_DATE
         ORDER BY a.appointment_date ASC`
      );

      return { bookings: bookingsResult.rows };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get bookings' });
    }
  });

  // Create booking
  fastify.post('/bookings', async (request, reply) => {
    const { patientId, doctorId, date, notes } = request.body;

    try {
      const result = await pool.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, notes, created_by, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [patientId, doctorId || null, date, notes || null, request.user.id, 'scheduled']
      );

      return { booking: result.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create booking' });
    }
  });

  // Update booking
  fastify.put('/bookings/:id', async (request, reply) => {
    const { id } = request.params;
    const { doctorId, date, status, notes } = request.body;

    try {
      const result = await pool.query(
        `UPDATE appointments 
         SET doctor_id = COALESCE($1, doctor_id),
             appointment_date = COALESCE($2, appointment_date),
             status = COALESCE($3, status),
             notes = COALESCE($4, notes),
             updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [doctorId, date, status, notes, id]
      );

      return { booking: result.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update booking' });
    }
  });

  // Delete booking
  fastify.delete('/bookings/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await pool.query('DELETE FROM appointments WHERE id = $1', [id]);
      return { message: 'Booking deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete booking' });
    }
  });

  // Get queue
  fastify.get('/queue', async (request, reply) => {
    try {
      const queueResult = await pool.query(
        `SELECT q.*, u1.name as patient_name, u2.name as doctor_name
         FROM queue q
         JOIN patients p ON q.patient_id = p.id
         JOIN users u1 ON p.user_id = u1.id
         LEFT JOIN doctors d ON q.doctor_id = d.id
         LEFT JOIN users u2 ON d.user_id = u2.id
         WHERE DATE(q.check_in_time) = CURRENT_DATE
         ORDER BY q.position ASC`
      );

      return { queue: queueResult.rows };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get queue' });
    }
  });

  // Add to queue
  fastify.post('/queue', async (request, reply) => {
    const { patientId, doctorId, appointmentId } = request.body;

    try {
      // Get next position
      const positionResult = await pool.query(
        `SELECT COALESCE(MAX(position), 0) + 1 as next_position 
         FROM queue 
         WHERE DATE(check_in_time) = CURRENT_DATE`
      );

      const position = positionResult.rows[0].next_position;

      const result = await pool.query(
        `INSERT INTO queue (patient_id, doctor_id, appointment_id, position, status, estimated_wait_time)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [patientId, doctorId || null, appointmentId || null, position, 'waiting', (position - 1) * 15]
      );

      return { queueEntry: result.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to add to queue' });
    }
  });

  // Update queue status
  fastify.put('/queue/:id', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;

    try {
      const result = await pool.query(
        `UPDATE queue 
         SET status = $1,
             start_time = CASE WHEN $1 = 'in-progress' THEN NOW() ELSE start_time END,
             end_time = CASE WHEN $1 IN ('completed', 'no-show') THEN NOW() ELSE end_time END,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      return { queueEntry: result.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update queue status' });
    }
  });
}

