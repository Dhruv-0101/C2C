/**
 * High-End HTML Password Reset Email Template for BrandFlow
 * @param {{ fullName: string, resetUrl: string }} params
 */
export function renderPasswordResetEmail({ fullName, resetUrl }) {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your BrandFlow Password</title>
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
      max-width: 600px;
      margin: 0 auto;
      background-color: #131B2A;
      border: 1px solid #2C384E;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
    .header-banner {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%);
      padding: 36px 30px;
      text-align: center;
      border-b: 1px solid #2C384E;
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
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.3;
    }
    .content-body {
      padding: 36px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #F59E0B;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .paragraph {
      font-size: 14px;
      line-height: 1.7;
      color: #94A3B8;
      margin-bottom: 24px;
    }
    .warning-box {
      background-color: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      margin: 24px 0;
      font-size: 13px;
      color: #FCD34D;
      line-height: 1.5;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 24px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
      color: #0B0F17 !important;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
    }
    .fallback-url {
      background-color: #0B0F17;
      border: 1px solid #2C384E;
      border-radius: 8px;
      padding: 12px;
      font-family: monospace;
      font-size: 11px;
      color: #F59E0B;
      word-break: break-all;
      margin-top: 16px;
    }
    .footer {
      padding: 24px 30px;
      background-color: #0B0F17;
      border-t: 1px solid #2C384E;
      text-align: center;
      font-size: 12px;
      color: #64748B;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <!-- Header Banner -->
      <div class="header-banner">
        <div class="logo-badge">
          Brand<span class="logo-highlight">Flow</span> 🔑
        </div>
        <h1 class="hero-title">Password Reset Request</h1>
      </div>

      <!-- Main Body -->
      <div class="content-body">
        <p class="greeting">Hello ${fullName || 'Creator'} 👋</p>
        <p class="paragraph">
          We received a request to reset the password for your <strong>BrandFlow</strong> account. Click the button below to choose a new password.
        </p>

        <!-- CTA Action -->
        <div class="cta-container">
          <a href="${resetUrl}" class="cta-button">Reset Your Password 🔐</a>
        </div>

        <!-- Warning Box -->
        <div class="warning-box">
          ⏰ <strong>Note:</strong> This password reset link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.
        </div>

        <p class="paragraph" style="margin-bottom: 8px; font-size: 12px;">
          Button not working? Copy and paste this URL into your web browser:
        </p>
        <div class="fallback-url">${resetUrl}</div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">© ${year} BrandFlow Platform. Enterprise AI Social Management.</p>
        <p style="margin: 0;">If you need assistance, contact our support team at support@brandflow.ai</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
