/**
 * High-End HTML OTP Verification Email Template for BrandFlow
 * Displays a clean 4-digit numeric verification code with 10-minute expiry and security alert.
 * 
 * @param {{ fullName?: string, otp: string, expiresInMinutes?: number }} params
 */
export function renderOtpEmail({ fullName, otp, expiresInMinutes = 10 }) {
  const year = new Date().getFullYear();
  const greeting = fullName ? `Hi ${fullName},` : 'Hello,';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BrandFlow Verification Code</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0B0F17;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0B0F17;
      padding: 40px 10px;
    }
    .main-card {
      max-width: 560px;
      margin: 0 auto;
      background-color: #131B2A;
      border: 1px solid #2C384E;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
    .header-banner {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%);
      padding: 36px 30px;
      text-align: center;
      border-bottom: 1px solid #2C384E;
    }
    .logo-badge {
      display: inline-block;
      padding: 8px 18px;
      background: #0B0F17;
      border: 1px solid #F59E0B;
      border-radius: 30px;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin-bottom: 12px;
    }
    .logo-highlight {
      color: #F59E0B;
    }
    .hero-title {
      margin: 12px 0 0 0;
      font-size: 24px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }
    .content-body {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #F8FAFC;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .lead-text {
      font-size: 14px;
      line-height: 1.6;
      color: #94A3B8;
      margin-bottom: 28px;
    }
    .otp-container {
      background: #0B0F17;
      border: 2px dashed #F59E0B;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin-bottom: 28px;
    }
    .otp-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #F59E0B;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .otp-code {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: 14px;
      color: #FFFFFF;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
      padding-left: 14px; /* balance out right letter-spacing */
    }
    .otp-expiry {
      font-size: 13px;
      color: #64748B;
      margin-top: 12px;
      margin-bottom: 0;
    }
    .security-notice {
      background: rgba(239, 68, 68, 0.08);
      border-left: 4px solid #EF4444;
      border-radius: 0 10px 10px 0;
      padding: 14px 18px;
      margin-bottom: 28px;
    }
    .security-notice p {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: #FCA5A5;
    }
    .footer {
      border-top: 1px solid #1E293B;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      background-color: #0C111C;
    }
    .footer a {
      color: #F59E0B;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <div class="header-banner">
        <div class="logo-badge">
          Brand<span class="logo-highlight">Flow</span>
        </div>
        <h1 class="hero-title">Verify Your Email Address</h1>
      </div>

      <div class="content-body">
        <p class="greeting">${greeting}</p>
        <p class="lead-text">
          Thank you for joining BrandFlow! To complete your account registration and secure your brand kit workspace, please enter the 4-digit verification code below:
        </p>

        <div class="otp-container">
          <div class="otp-label">Your 4-Digit Verification Code</div>
          <div class="otp-code">${otp}</div>
          <p class="otp-expiry">⏱️ Valid for <strong>${expiresInMinutes} minutes</strong></p>
        </div>

        <div class="security-notice">
          <p>
            🔒 <strong>Security Warning:</strong> Never share this code with anyone. BrandFlow representatives will never ask for your verification code. If you did not attempt to register, you can safely disregard this email.
          </p>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0;">&copy; ${year} BrandFlow Inc. All rights reserved.</p>
        <p style="margin: 0;">Automated AI Social Media Management Platform for Small Businesses.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
