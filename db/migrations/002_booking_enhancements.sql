-- Booking & scheduling enhancements: types, notes, cancellation reason, multi-service, provider availability, recurrence, waiting list

-- Appointments: new columns
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50) DEFAULT 'treatment';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_rule VARCHAR(30);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

-- Multi-service: one appointment can have multiple services
CREATE TABLE IF NOT EXISTS appointment_services (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_appointment_services_appointment_id ON appointment_services(appointment_id);

-- Provider weekly availability (day_of_week 1=Mon .. 7=Sun)
CREATE TABLE IF NOT EXISTS provider_availability (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, day_of_week)
);
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider ON provider_availability(provider_id);

-- Date-specific overrides (e.g. holiday, extra hours)
CREATE TABLE IF NOT EXISTS provider_availability_overrides (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_id, override_date)
);
CREATE INDEX IF NOT EXISTS idx_provider_override_provider_date ON provider_availability_overrides(provider_id, override_date);

-- Waiting list for fully booked slots
CREATE TABLE IF NOT EXISTS waiting_list (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  service_type VARCHAR(100) NOT NULL,
  preferred_date_from DATE NOT NULL,
  preferred_date_to DATE,
  provider_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_waiting_list_status ON waiting_list(status);
CREATE INDEX IF NOT EXISTS idx_waiting_list_dates ON waiting_list(preferred_date_from, preferred_date_to);
