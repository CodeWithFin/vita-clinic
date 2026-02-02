
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
