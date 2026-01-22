CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_type VARCHAR(100) NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS queue (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ticket_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'serving', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
