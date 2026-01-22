
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

export async function sendSMS(phone: string, message: string) {
  if (!process.env.TILIL_API_KEY || !process.env.TILIL_SHORTCODE || !process.env.SMS_ENDPOINT) {
      console.error("Missing SMS Environment Variables - SMS wil not be sent.");
      return null;
  }

  const formattedPhone = formatPhoneNumber(phone);
  
  console.log('Sending SMS to:', formattedPhone);

  try {
    const payload = {
      api_key: process.env.TILIL_API_KEY,
      shortcode: process.env.TILIL_SHORTCODE, // Use 'shortcode' (no underscore) based on debug results
      mobile: formattedPhone,
      message: message
    };
    
    // Log payload for debugging (hide sensitive key)
    // console.log('SMS Payload:', JSON.stringify({ ...payload, api_key: '***' }, null, 2));

    const response = await fetch(process.env.SMS_ENDPOINT!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('SMS Service Response:', data);

    return data;

  } catch (error) {
    console.error('Failed to send SMS:', error);
    return null;
  }
}
