-- SMS module: logs, templates, client opt-in, reminder settings

-- Client opt-in/opt-out for SMS
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT true;

-- Configurable SMS templates (e.g. confirmation, reminder, cancellation, follow-up, promotional)
CREATE TABLE IF NOT EXISTS sms_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  body TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sms_templates_slug ON sms_templates(slug);

-- Placeholder variables in templates: {{name}}, {{service}}, {{date}}, {{time}}, {{reason}}, etc.
INSERT INTO sms_templates (name, slug, body, description, is_system) VALUES
  ('Appointment confirmation', 'appointment_confirmation', 'Hi {{name}}, your appointment for {{service}} on {{date}} at {{time}} is confirmed. - Vitapharm', 'Sent when booking is confirmed', true),
  ('Appointment reminder', 'appointment_reminder', 'Hi {{name}}, reminder: your appointment for {{service}} is on {{date}} at {{time}}. - Vitapharm', 'Sent 1 day or 2 hours before', true),
  ('Appointment cancelled', 'appointment_cancelled', 'Hi {{name}}, your appointment ({{service}}) has been cancelled.{{#reason}} Reason: {{reason}}{{/reason}} - Vitapharm', 'Sent when appointment is cancelled', true)
ON CONFLICT (slug) DO NOTHING;

-- SMS log per send (for history per client and delivery status)
CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  template_slug VARCHAR(50),
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  direction VARCHAR(20) DEFAULT 'outbound',
  status VARCHAR(30) DEFAULT 'sent',
  external_id VARCHAR(100),
  failure_reason TEXT,
  reminder_hours_before INTEGER,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sms_logs_client_id ON sms_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);

-- Reminder schedule: 1 day before, 2 hours before (stored in app config or env; optional table for admin UI)
CREATE TABLE IF NOT EXISTS sms_reminder_settings (
  id SERIAL PRIMARY KEY,
  reminder_type VARCHAR(30) NOT NULL UNIQUE,
  hours_before INTEGER NOT NULL,
  template_slug VARCHAR(50) REFERENCES sms_templates(slug),
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO sms_reminder_settings (reminder_type, hours_before, template_slug, enabled) VALUES
  ('1_day_before', 24, 'appointment_reminder', true),
  ('2_hours_before', 2, 'appointment_reminder', true)
ON CONFLICT (reminder_type) DO NOTHING;
