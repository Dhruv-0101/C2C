import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { renderWelcomeEmail } from '../templates/welcome-email.template.js';

// Create Nodemailer Transporter
let transporter = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: Number(env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

/**
 * Send Welcome Email asynchronously upon user signup
 * @param {{ email: string, fullName: string }} params
 */
export async function sendWelcomeEmail({ email, fullName }) {
  const loginUrl = `${env.CLIENT_URL}/login`;
  const htmlContent = renderWelcomeEmail({ fullName, loginUrl });

  const mailOptions = {
    from: `"BrandFlow Team" <${env.FROM_EMAIL}>`,
    to: email,
    subject: 'Welcome to BrandFlow ✨ Your AI Social Media Engine is Ready!',
    html: htmlContent,
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ Welcome email successfully sent to ${email} (MessageId: ${info.messageId})`);
    } else {
      console.log(`✉️ [SMTP Simulation] Welcome email generated for ${email}. (Set SMTP_USER & SMTP_PASS in .env to send real emails)`);
    }
  } catch (error) {
    console.error(`⚠️ Failed to send welcome email to ${email}:`, error.message);
  }
}
