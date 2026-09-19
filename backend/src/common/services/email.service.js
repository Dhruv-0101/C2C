import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { renderWelcomeEmail } from '../templates/welcome-email.template.js';
import { renderPasswordResetEmail } from '../templates/password-reset-email.template.js';
import { renderPostPublishedEmail } from '../templates/post-published-email.template.js';

// Safe default fallback sender email (prevents fatal SMTP 550 syntax rejections if FROM_EMAIL is missing)
const DEFAULT_FROM_EMAIL = env.FROM_EMAIL || env.SMTP_USER || 'noreply@brandflow.com';

// Track SMTP availability state without destroying the instance on transient startup glitches
let isSmtpAvailable = false;
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

    // 🏊 1. CONNECTION POOLING (High-Throughput Socket Reuse):
    // - Real World Analogy: Dedicated highway fast-lane rather than building a new road for every car.
    // - WHY: Instead of opening and tearing down an expensive 3-way TLS handshake for every single email,
    //   Nodemailer keeps a pool of authenticated TCP connections open. Critical for enterprise scale (100,000+ users).
    pool: true,
    maxConnections: 5,        // Max 5 simultaneous TCP connections to SMTP server
    maxMessages: 100,         // Closes and refreshes socket connection after 100 emails to prevent memory bloat
    rateDelta: 1000,          // Time window in ms for rate limiting
    rateLimit: 5,             // Caps transmission to 5 emails per second to avoid triggering provider spam flags

    // ⏱️ 2. TIMEOUT GUARDS (Thread & Background Worker Starvation Protection):
    // - Prevents BullMQ background workers and HTTP threads from hanging indefinitely on dead/lagging SMTP sockets.
    connectionTimeout: 10000, // 10 seconds: aborts if TCP connection cannot be established
    greetingTimeout: 10000,   // 10 seconds: aborts if SMTP server fails to send 220 banner greeting
    socketTimeout: 15000,     // 15 seconds: aborts if socket remains inactive during data transmission

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
      isSmtpAvailable = false;
    } else {
      isSmtpAvailable = true;
      logger.success(`✅ SMTP Transporter initialized & authenticated via ${env.SMTP_USER}!`);
    }
  });
}

/**
 * Send Welcome Email asynchronously upon user signup
 * 
 * Includes:
 * - HTML & Plain Text alternative (Anti-Spam Filter Guard for deliverability)
 * - Safe fallback sender header
 * - Automatic error propagation for BullMQ queue retry backoff
 * 
 * @param {{ email: string, fullName: string }} params
 */
export async function sendWelcomeEmail({ email, fullName }) {
  const loginUrl = `${env.CLIENT_URL}/login`;
  const htmlContent = renderWelcomeEmail({ fullName, loginUrl });

  // 🛡️ PLAIN TEXT ALTERNATIVE (Anti-Spam Filter Guard):
  // Mail clients & spam algorithms (SpamAssassin, Gmail) penalize HTML-only emails without a plain-text fallback.
  const textContent = `Hi ${fullName || 'there'},\n\nWelcome to BrandFlow! Your account is ready.\nLog in to start creating branded social posts:\n${loginUrl}\n\n- The BrandFlow Team`;

  const mailOptions = {
    from: `"BrandFlow Team" <${DEFAULT_FROM_EMAIL}>`,
    to: email,
    subject: 'Welcome to BrandFlow ✨ Create Branded Social Posts!',
    text: textContent,
    html: htmlContent,
  };

  try {
    if (transporter && isSmtpAvailable) {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`✉️ Welcome email successfully sent to ${email} (MessageId: ${info.messageId})`);
      return info;
    } else {
      logger.info(`✉️ [SMTP Simulation] Welcome email generated for ${email}. (Set valid SMTP_USER & SMTP_PASS in .env to send real emails)`);
      return { simulated: true, email };
    }
  } catch (error) {
    logger.error(`❌ Failed to send welcome email to ${email}:`, error.message);
    // Rethrow error so BullMQ worker can trigger its 3-attempt exponential backoff retry
    throw error;
  }
}

/**
 * Send Password Reset Email asynchronously with secure reset URL
 * 
 * Includes:
 * - HTML & Plain Text fallback with explicit 1-hour expiration warning
 * - Automatic error propagation for BullMQ background queue retries
 * 
 * @param {{ email: string, fullName: string, resetUrl: string }} params
 */
export async function sendPasswordResetEmail({ email, fullName, resetUrl }) {
  const htmlContent = renderPasswordResetEmail({ fullName, resetUrl });

  // 🛡️ PLAIN TEXT ALTERNATIVE:
  const textContent = `Hi ${fullName || 'there'},\n\nWe received a request to reset your BrandFlow password.\nClick the link below to set a new password:\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this, you can safely ignore this email.\n\n- BrandFlow Security`;

  const mailOptions = {
    from: `"BrandFlow Security" <${DEFAULT_FROM_EMAIL}>`,
    to: email,
    subject: 'Reset Your BrandFlow Password 🔑',
    text: textContent,
    html: htmlContent,
  };

  try {
    if (transporter && isSmtpAvailable) {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`✉️ Password reset email successfully sent to ${email} (MessageId: ${info.messageId})`);
      return info;
    } else {
      logger.info(`✉️ [SMTP Simulation] Password reset email generated for ${email}. Link: ${resetUrl}`);
      return { simulated: true, email, resetUrl };
    }
  } catch (error) {
    logger.error(`❌ Failed to send password reset email to ${email}:`, error.message);
    // Rethrow error so BullMQ worker can trigger its 3-attempt exponential backoff retry
    throw error;
  }
}

/**
 * Send Post Published Email Notification
 * 
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

  const platformsList = Array.isArray(targetPlatforms) && targetPlatforms.length > 0
    ? targetPlatforms.join(', ')
    : 'Selected Social Channels';

  // 🛡️ PLAIN TEXT ALTERNATIVE:
  const textContent = `Hi ${fullName || 'there'},\n\nGreat news! Your post "${postTitle || 'Social Graphic'}" was published successfully to ${platformsList} on ${publishedAt || new Date().toLocaleString()}.\n\nView performance analytics in your BrandFlow dashboard:\n${env.CLIENT_URL}/dashboard\n\n- BrandFlow Alerts`;

  const mailOptions = {
    from: `"BrandFlow Alerts" <${DEFAULT_FROM_EMAIL}>`,
    to: email,
    subject: `🎉 Your Post "${postTitle || 'Social Graphic'}" was Published Successfully!`,
    text: textContent,
    html: htmlContent,
  };

  try {
    if (transporter && isSmtpAvailable) {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`✉️ Post Published email notification sent to ${email} (MessageId: ${info.messageId})`);
      return info;
    } else {
      logger.info(`✉️ [SMTP Simulation] Post Published email alert generated for ${email}.`);
      return { simulated: true, email };
    }
  } catch (error) {
    logger.error(`❌ Failed to send post published email notification to ${email}:`, error.message);
    throw error;
  }
}

/**
 * Send Invoice Email Notification with PDF attachment asynchronously
 * 
 * Dynamically builds an enterprise invoice PDF in-memory and attaches it as binary stream
 * 
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

    // 🛡️ PLAIN TEXT ALTERNATIVE:
    const textContent = `Hi ${tx.user.fullName || 'there'},\n\nThank you for your purchase on BrandFlow!\nPlan: ${planName}\nInvoice Number: ${invoiceNum}\nAmount Paid: ${tx.currency || 'INR'} ${tx.pricePaid || 0}\nPayment Gateway: ${tx.paymentGateway || 'FREE'}\n\nYour official tax invoice PDF is attached to this email.\n\n- BrandFlow Billing`;

    const fileName = `BrandFlow_Invoice_${tx.id.substring(0, 8)}.pdf`;

    const mailOptions = {
      from: `"BrandFlow Billing" <${DEFAULT_FROM_EMAIL}>`,
      to: tx.user.email,
      subject: `🧾 Your BrandFlow Invoice - ${planName} (${invoiceNum})`,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    if (transporter && isSmtpAvailable) {
      const info = await transporter.sendMail(mailOptions);
      logger.success(`✉️ Invoice PDF email successfully sent to ${tx.user.email} (MessageId: ${info.messageId})`);
      return info;
    } else {
      logger.info(`✉️ [SMTP Simulation] Invoice PDF email generated for ${tx.user.email} with PDF attachment (${pdfBuffer.length} bytes).`);
      return { simulated: true, email: tx.user.email, invoiceNum };
    }
  } catch (error) {
    logger.error(`❌ Failed to send invoice email for transaction ${transactionId}:`, error.message);
    throw error;
  }
}
