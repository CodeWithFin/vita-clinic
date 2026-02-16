-- Same-day reminder + extra SMS templates (follow-up care, promotional, birthday)

INSERT INTO sms_templates (name, slug, body, description, is_system) VALUES
  ('Follow-up care', 'follow_up_care', 'Hi {{name}}, hope you are well after your recent {{service}}. Remember: {{care_instructions}}. - Vitapharm', 'Post-treatment care instructions', true),
  ('Promotional', 'promotional', 'Hi {{name}}, {{message}} - Vitapharm', 'Marketing / promotional messages', true),
  ('Birthday wishes', 'birthday_wishes', 'Happy Birthday {{name}}! Thank you for being part of the Vitapharm family. We look forward to celebrating with you. - Vitapharm', 'Birthday wishes', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO sms_reminder_settings (reminder_type, hours_before, template_slug, enabled) VALUES
  ('same_day', 6, 'appointment_reminder', true)
ON CONFLICT (reminder_type) DO NOTHING;
