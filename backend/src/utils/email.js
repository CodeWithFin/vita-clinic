import pkg from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const { createTransport } = pkg;

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email, otp) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Your Vitapharm Clinic OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f1f12;">Vitapharm Clinic</h2>
          <p>Your one-time password (OTP) is:</p>
          <div style="background: #d4ff33; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    return false;
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Welcome to Vitapharm Clinic',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f1f12;">Welcome to Vitapharm Clinic, ${name}!</h2>
          <p>Your account has been successfully created.</p>
          <p>You can now book appointments and access your medical records online.</p>
          <p style="margin-top: 30px;">Best regards,<br>Vitapharm Clinic Team</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

 
