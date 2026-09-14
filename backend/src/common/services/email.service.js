import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { renderWelcomeEmail } from '../templates/welcome-email.template.js';
import { renderPasswordResetEmail } from '../templates/password-reset-email.template.js';
import { renderPostPublishedEmail } from '../templates/post-published-email.template.js';

// Create Nodemailer Transporter
let transporter = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    // 📮 SMTP MAIL SERVER CONFIGURATION:
    // - host: Domain address of the mail server (Gmail, SendGrid, Mailgun, AWS SES)
    host: env.SMTP_HOST || 'smtp.gmail.com',
    
    // - port: 587 = Standard STARTTLS port (upgrades connection to TLS); 465 = Legacy SSL port
    port: Number(env.SMTP_PORT) || 587,
    
    // - secure: true ONLY for port 465 (implicit SSL). For port 587, set false so it starts plain & upgrades via STARTTLS
    secure: Number(env.SMTP_PORT) === 465,
    
    // - requireTLS: Aborts connection if mail server does NOT support encrypted TLS transmission
    requireTLS: true,
    
    // - auth: Sender email address and 16-character App Password (for Gmail 2FA enabled accounts)
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    // TLS (Transport Layer Security) Encryption & Certificate Validation:
    // - Real World Analogy: Passport Officer checking if a ID card is genuine or fake.
    // - Production (rejectUnauthorized: true): Enforces strict SSL/TLS certificate verification to block Man-in-the-Middle (MITM) attacks.
    // - Development (rejectUnauthorized: false): Allows local testing with self-signed SSL certs or local mail proxies (Mailtrap/Docker).
    tls: {
      rejectUnauthorized: env.NODE_ENV === 'production',
    },
  });

  // Verify SMTP Connection readiness on startup gracefully
  transporter.verify((error) => {
    if (error) {
      logger.warn(`⚠️ SMTP Connection warning (${error.message}). Falling back to Email Simulation mode.`);
      transporter = null;
    } else {
      logger.success(`✅ SMTP Transporter initialized & authenticated via ${env.SMTP_USER}!`);
    }
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
    subject: 'Welcome to BrandFlow ✨ Create Branded Social Posts!',
    html: htmlContent,
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`✉️ Welcome email successfully sent to ${email} (MessageId: ${info.messageId})`);
    } else {
      logger.info(`✉️ [SMTP Simulation] Welcome email generated for ${email}. (Set SMTP_USER & SMTP_PASS in .env to send real emails)`);
    }
  } catch (error) {
    logger.error(`❌ Failed to send welcome email to ${email}:`, error.message);
  }
}

/**
 * Send Password Reset Email asynchronously with secure reset URL
 * @param {{ email: string, fullName: string, resetUrl: string }} params
 */
export async function sendPasswordResetEmail({ email, fullName, resetUrl }) {
  const htmlContent = renderPasswordResetEmail({ fullName, resetUrl });

  const mailOptions = {
    from: `"BrandFlow Security" <${env.FROM_EMAIL}>`,
    to: email,
    subject: 'Reset Your BrandFlow Password 🔑',
    html: htmlContent,
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`✉️ Password reset email successfully sent to ${email} (MessageId: ${info.messageId})`);
    } else {
      logger.info(`✉️ [SMTP Simulation] Password reset email generated for ${email}. Link: ${resetUrl}`);
    }
  } catch (error) {
    logger.error(`❌ Failed to send password reset email to ${email}:`, error.message);
  }
}

/**
 * Send Post Published Email Notification
 * @param {{ email: string, fullName: string, postTitle: string, targetPlatforms: string[], platformResults: Object, publishedAt: string }} params
 */
export async function sendPostPublishedEmail({ email, fullName, postTitle, targetPlatforms, platformResults, publishedAt }) {
  const htmlContent = renderPostPublishedEmail({
    fullName,
    postTitle,
    targetPlatforms,
    platformResults,
    publishedAt,
  });

  const mailOptions = {
    from: `"BrandFlow Alerts" <${env.FROM_EMAIL}>`,
    to: email,
    subject: `🎉 Your Post "${postTitle || 'Social Graphic'}" was Published Successfully!`,
    html: htmlContent,
  };

  try {
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`✉️ Post Published email notification sent to ${email} (MessageId: ${info.messageId})`);
    } else {
      logger.info(`✉️ [SMTP Simulation] Post Published email alert generated for ${email}.`);
    }
  } catch (error) {
    logger.error(`❌ Failed to send post published email notification to ${email}:`, error.message);
  }
}

/**
 * Send Invoice Email Notification with PDF attachment asynchronously
 * @param {{ userId: string, transactionId: string }} params
 */
export async function sendInvoiceEmail({ userId, transactionId }) {
  try {
    const { billingRepository } = await import('../../modules/billing/billing.repository.js');
    const { buildInvoicePdfBuffer } = await import('../../modules/billing/billing.pdf.js');
    const { renderInvoiceEmail } = await import('../templates/invoice-email.template.js');

    const tx = await billingRepository.findTransactionById(transactionId);
    if (!tx || !tx.user?.email) {
      logger.warn(`⚠️ [sendInvoiceEmail] Transaction or user email not found for txId ${transactionId}`);
      return;
    }

    const pdfBuffer = await buildInvoicePdfBuffer(tx, tx.user, tx.user?.brandKit || {});

    let planName = 'Free Starter Plan';
    if (tx.transactionType === 'ADMIN_BONUS' || tx.paymentGateway === 'ADMIN_BONUS') {
      planName = 'Admin Bonus Quota Top-Up';
    } else if (tx.plan === 'PRO') {
      planName = `Pro Plan (${tx.postCount} Posts)`;
    }

    const invoiceNum = `INV-${new Date(tx.createdAt || Date.now()).toISOString().slice(0, 10).replace(/-/g, '')}-${tx.id.substring(0, 6).toUpperCase()}`;

    const htmlContent = renderInvoiceEmail({
      fullName: tx.user.fullName,
      planName,
      postCount: tx.postCount || 5,
      pricePaid: tx.pricePaid || 0,
      currency: tx.currency || 'INR',
      paymentGateway: tx.paymentGateway || 'FREE',
      invoiceNum,
      dashboardUrl: `${env.CLIENT_URL}/profile`,
    });

    const fileName = `BrandFlow_Invoice_${tx.id.substring(0, 8)}.pdf`;

    const mailOptions = {
      from: `"BrandFlow Billing" <${env.FROM_EMAIL}>`,
      to: tx.user.email,
      subject: `🧾 Your BrandFlow Invoice - ${planName} (${invoiceNum})`,
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`✉️ Invoice PDF email successfully sent to ${tx.user.email} (MessageId: ${info.messageId})`);
    } else {
      logger.info(`✉️ [SMTP Simulation] Invoice PDF email generated for ${tx.user.email} with PDF attachment (${pdfBuffer.length} bytes).`);
    }
  } catch (error) {
    logger.error(`❌ Failed to send invoice email for transaction ${transactionId}:`, error.message);
  }
}
