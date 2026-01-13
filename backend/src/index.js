import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patient.js';
import receptionistRoutes from './routes/receptionist.js';
import doctorRoutes from './routes/doctor.js';
import adminRoutes from './routes/admin.js';
import websocketHandler from './websocket/handler.js';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Register plugins
await fastify.register(cors, {
  origin: true
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'change-this-secret-key'
});

await fastify.register(websocket);

// Auth decorator
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Role-based auth decorator
fastify.decorate('authorize', (roles) => {
  return async function(request, reply) {
    try {
      await request.jwtVerify();
      if (!roles.includes(request.user.role)) {
        reply.code(403).send({ error: 'Forbidden' });
      }
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  };
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(patientRoutes, { prefix: '/api/patient' });
fastify.register(receptionistRoutes, { prefix: '/api/receptionist' });
fastify.register(doctorRoutes, { prefix: '/api/doctor' });
fastify.register(adminRoutes, { prefix: '/api/admin' });

// WebSocket route
fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, websocketHandler);
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📡 WebSocket available on ws://localhost:${port}/ws`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

