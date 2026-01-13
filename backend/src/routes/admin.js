import bcrypt from 'bcrypt';
import pool from '../db/pool.js';

export default async function adminRoutes(fastify, options) {
  // All routes require admin role
  fastify.addHook('onRequest', fastify.authorize(['admin']));

  // Get dashboard
  fastify.get('/dashboard', async (request, reply) => {
    try {
      // Get stats
      const totalPatients = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'patient'"
      );

      const activeDoctors = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'doctor' AND is_active = true"
      );

      const todayVisits = await pool.query(
        'SELECT COUNT(*) FROM visits WHERE DATE(visit_date) = CURRENT_DATE'
      );

      // Get recent activity (mock data)
      const recentActivity = [
        { message: 'New doctor added: Dr. Smith', time: '2 hours ago' },
        { message: 'System backup completed', time: '5 hours ago' },
        { message: 'New patient registered', time: '1 day ago' },
      ];

      return {
        stats: {
          totalPatients: parseInt(totalPatients.rows[0].count),
          activeDoctors: parseInt(activeDoctors.rows[0].count),
          todayVisits: parseInt(todayVisits.rows[0].count),
        },
        recentActivity,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to load dashboard' });
    }
  });

  // Get all users
  fastify.get('/users', async (request, reply) => {
    try {
      const usersResult = await pool.query(
        `SELECT id, email, role, name, phone, is_active, created_at
         FROM users
         WHERE role IN ('receptionist', 'doctor', 'admin')
         ORDER BY created_at DESC`
      );

      return { users: usersResult.rows };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get users' });
    }
  });

  // Create user
  fastify.post('/users', async (request, reply) => {
    const { name, email, password, role } = request.body;

    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return reply.code(400).send({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, role, name, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, role, name`,
        [email, passwordHash, role, name, true]
      );

      // If doctor, create doctor record
      if (role === 'doctor') {
        await pool.query(
          'INSERT INTO doctors (user_id) VALUES ($1)',
          [userResult.rows[0].id]
        );
      }

      return { user: userResult.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create user' });
    }
  });

  // Update user
  fastify.put('/users/:id', async (request, reply) => {
    const { id } = request.params;
    const { name, email, role, isActive } = request.body;

    try {
      const result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             role = COALESCE($3, role),
             is_active = COALESCE($4, is_active),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, email, role, name, is_active`,
        [name, email, role, isActive, id]
      );

      return { user: result.rows[0] };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update user' });
    }
  });

  // Delete user
  fastify.delete('/users/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return { message: 'User deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete user' });
    }
  });

  // Get system config
  fastify.get('/config', async (request, reply) => {
    try {
      const configResult = await pool.query('SELECT * FROM system_config');

      const config = {};
      configResult.rows.forEach(row => {
        config[row.config_key] = row.config_value;
      });

      return config;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get config' });
    }
  });

  // Update system config
  fastify.put('/config', async (request, reply) => {
    const config = request.body;

    try {
      for (const [key, value] of Object.entries(config)) {
        await pool.query(
          `INSERT INTO system_config (config_key, config_value, updated_by)
           VALUES ($1, $2, $3)
           ON CONFLICT (config_key) 
           DO UPDATE SET config_value = $2, updated_by = $3, updated_at = NOW()`,
          [key, JSON.stringify(value), request.user.id]
        );
      }

      return { message: 'Configuration updated successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update config' });
    }
  });

  // Get reports
  fastify.get('/reports', async (request, reply) => {
    try {
      // Generate basic reports
      const dailyVisits = await pool.query(
        `SELECT DATE(visit_date) as date, COUNT(*) as count
         FROM visits
         WHERE visit_date >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(visit_date)
         ORDER BY date DESC`
      );

      const topDoctors = await pool.query(
        `SELECT u.name, COUNT(v.id) as visit_count
         FROM visits v
         JOIN doctors d ON v.doctor_id = d.id
         JOIN users u ON d.user_id = u.id
         WHERE v.visit_date >= NOW() - INTERVAL '30 days'
         GROUP BY u.name
         ORDER BY visit_count DESC
         LIMIT 5`
      );

      return {
        dailyVisits: dailyVisits.rows,
        topDoctors: topDoctors.rows,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to generate reports' });
    }
  });
}

