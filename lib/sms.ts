import { db } from '@/lib/db';

export function formatPhoneNumber(phone: string) {
  // Remove all non-numeric characters first (including +)
  let cleaned = phone.replace(/\D/g, '');

  // Handle Kenyan numbers
  if (cleaned.startsWith('0') && cleaned.length === 10) {
      // 07XXXXXXXX -> 2547XXXXXXXX
      cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
      // 7XXXXXXXX -> 2547XXXXXXXX
      cleaned = '254' + cleaned;
  } else if (cleaned.startsWith('254') && cleaned.length === 12) {
      // 2547XXXXXXXX -> Keep as is
  }
  
  return cleaned;
}

export type SendSMSResult = { sent: true; data?: unknown } | { sent: false; reason: string };

export async function sendSMS(phone: string, message: string): Promise<SendSMSResult> {
  if (!process.env.TILIL_API_KEY || !process.env.TILIL_SHORTCODE || !process.env.SMS_ENDPOINT) {
    const missing = [
      !process.env.TILIL_API_KEY && 'TILIL_API_KEY',
      !process.env.TILIL_SHORTCODE && 'TILIL_SHORTCODE',
      !process.env.SMS_ENDPOINT && 'SMS_ENDPOINT',
    ].filter(Boolean);
    console.error('SMS not sent: missing env vars:', missing.join(', '));
    return { sent: false, reason: 'SMS is not configured. Add TILIL_API_KEY, TILIL_SHORTCODE, and SMS_ENDPOINT to .env' };
  }

  const formattedPhone = formatPhoneNumber(phone);
  if (!formattedPhone || formattedPhone.length < 10) {
    console.error('SMS not sent: invalid phone:', phone);
    return { sent: false, reason: 'Invalid phone number' };
  }

  console.log('Sending SMS to:', formattedPhone);

  try {
    const payload = {
      api_key: process.env.TILIL_API_KEY,
      shortcode: process.env.TILIL_SHORTCODE,
      mobile: formattedPhone,
      message: message,
    };

    const response = await fetch(process.env.SMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    console.log('SMS Service Response:', response.status, data);

    if (!response.ok) {
      console.error('SMS API error:', response.status, data);
      return { sent: false, reason: (data as { message?: string })?.message || `API returned ${response.status}` };
    }

    return { sent: true, data };
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return { sent: false, reason: error instanceof Error ? error.message : 'Network or server error' };
  }
}

const DEFAULT_RETRIES = 2;

/** Send SMS with retries on failure (e.g. transient network/API errors). */
export async function sendSMSWithRetry(
  phone: string,
  message: string,
  options?: { maxRetries?: number }
): Promise<SendSMSResult> {
  const maxRetries = Math.max(0, options?.maxRetries ?? DEFAULT_RETRIES);
  let last: SendSMSResult = { sent: false, reason: 'Unknown' };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    last = await sendSMS(phone, message);
    if (last.sent) return last;
    if (attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return last;
}

export type SMSLogParams = {
  client_id?: number | null;
  user_id?: number | null;
  phone: string;
  message: string;
  template_slug?: string | null;
  appointment_id?: number | null;
  reminder_hours_before?: number | null;
  created_by?: number | null;
  result: SendSMSResult;
};

/** Persist SMS to sms_logs for history and delivery status. Call after sendSMS/sendSMSWithRetry. */
export async function logSMSResult(params: SMSLogParams): Promise<void> {
  const { client_id, user_id, phone, message, template_slug, appointment_id, reminder_hours_before, created_by, result } = params;
  const status = result.sent ? 'sent' : 'failed';
  const failure_reason = result.sent ? null : result.reason;
  const external_id = result.sent && result.data && typeof (result.data as { id?: string }).id === 'string'
    ? (result.data as { id: string }).id
    : null;
  try {
    await db.query(
      `INSERT INTO sms_logs (client_id, user_id, phone, message, template_slug, appointment_id, reminder_hours_before, direction, status, failure_reason, external_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'outbound', $8, $9, $10, $11)`,
      [client_id ?? null, user_id ?? null, phone, message, template_slug ?? null, appointment_id ?? null, reminder_hours_before ?? null, status, failure_reason, external_id, created_by ?? null]
    );
  } catch (e) {
    console.error('Failed to log SMS:', e);
  }
}
