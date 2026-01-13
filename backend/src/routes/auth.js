import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import { sendOTPEmail } from '../utils/email.js';
import { generateOTP, isOTPExpired, getOTPExpiryTime } from '../utils/otp.js';

export default async function authRoutes(fastify, options) {
  // Send OTP for patient login
  fastify.post('/send-otp', async (request, reply) => {
    const { email } = request.body;

    if (!email) {
      return reply.code(400).send({ error: 'Email is required' });
    }

    try {
      // Check if user exists, if not create one
      let userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND role = $2',
        [email, 'patient']
      );

      if (userResult.rows.length === 0) {
        // Create new patient user
        const insertUser = await pool.query(
          `INSERT INTO users (email, role, name, is_active) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id, email, role, name`,
          [email, 'patient', email.split('@')[0], true]
        );

        // Create patient record
        await pool.query(
          'INSERT INTO patients (user_id) VALUES ($1)',
          [insertUser.rows[0].id]
        );
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpiryTime();

      // Store OTP
      await pool.query(
        'INSERT INTO otps (email, otp_code, expires_at) VALUES ($1, $2, $3)',
        [email, otp, expiresAt]
      );

      // Log OTP for development (remove in production!)
      console.log(`\n🔐 OTP for ${email}: ${otp}\n`);

      // Send OTP via email (don't fail if email sending fails)
      try {
        await sendOTPEmail(email, otp);
      } catch (error) {
        console.log('Email sending failed (this is OK in development):', error.message);
      }

      return { message: 'OTP sent successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to send OTP' });
    }
  });

  // Verify OTP and login
  fastify.post('/verify-otp', async (request, reply) => {
    const { email, otp } = request.body;

    if (!email || !otp) {
      return reply.code(400).send({ error: 'Email and OTP are required' });
    }

    try {
      // Get OTP from database
      const otpResult = await pool.query(
        `SELECT * FROM otps 
         WHERE email = $1 AND otp_code = $2 AND used = false 
         ORDER BY created_at DESC LIMIT 1`,
        [email, otp]
      );

      if (otpResult.rows.length === 0) {
        return reply.code(401).send({ error: 'Invalid OTP' });
      }

      const otpRecord = otpResult.rows[0];

      if (isOTPExpired(otpRecord.expires_at)) {
        return reply.code(401).send({ error: 'OTP expired' });
      }

      // Mark OTP as used
      await pool.query(
        'UPDATE otps SET used = true WHERE id = $1',
        [otpRecord.id]
      );

      // Get user
      const userResult = await pool.query(
        'SELECT id, email, role, name FROM users WHERE email = $1 AND role = $2',
        [email, 'patient']
      );

      if (userResult.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      // Generate JWT token
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to verify OTP' });
    }
  });

  // Staff login with password
  fastify.post('/staff-login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    try {
      const userResult = await pool.query(
        `SELECT id, email, password_hash, role, name, is_active 
         FROM users 
         WHERE email = $1 AND role IN ('receptionist', 'doctor', 'admin')`,
        [email]
      );

      if (userResult.rows.length === 0) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const user = userResult.rows[0];

      if (!user.is_active) {
        return reply.code(401).send({ error: 'Account is deactivated' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to login' });
    }
  });
}

