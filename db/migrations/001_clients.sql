-- Client Management: separate clients table and client_id on appointments, queue, patient_records
-- Run after init.sql and after patient_records exists (create-records-table.js, doctor-queue-records-schema.js)

-- Clients table (full profile per PRD)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  profile_photo_url TEXT,
  preferences JSONB DEFAULT '{}',
  notes TEXT,
  skin_type VARCHAR(100),
  skin_concerns TEXT,
  allergies TEXT,
  contraindications TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'VIP', 'archived')),
  total_spent NUMERIC(12,2) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON clients(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_name_lower ON clients(LOWER(name));

-- Appointments: link to client
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);

-- Queue: link to client
ALTER TABLE queue ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id);
CREATE INDEX IF NOT EXISTS idx_queue_client_id ON queue(client_id);

-- Patient records (treatment notes): link to client
ALTER TABLE patient_records ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id);
CREATE INDEX IF NOT EXISTS idx_patient_records_client_id ON patient_records(client_id);

-- Sequence for client_id numeric part (VC-000001, VC-000002, ...)
CREATE SEQUENCE IF NOT EXISTS clients_number_seq START 1;

CREATE OR REPLACE FUNCTION set_client_id_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_id IS NULL OR NEW.client_id = '' THEN
    NEW.client_id := 'VC-' || LPAD(NEXTVAL('clients_number_seq')::TEXT, 6, '0');
  END IF;
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_clients_client_id ON clients;
CREATE TRIGGER set_clients_client_id
  BEFORE INSERT ON clients
  FOR EACH ROW
  EXECUTE PROCEDURE set_client_id_before_insert();

-- Update updated_at on change
CREATE OR REPLACE FUNCTION clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE PROCEDURE clients_updated_at();
