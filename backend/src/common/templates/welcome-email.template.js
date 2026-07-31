/**
 * High-End HTML Welcome Email Template for BrandFlow
 * @param {{ fullName: string, loginUrl: string }} params
 */
export function renderWelcomeEmail({ fullName, loginUrl }) {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BrandFlow</title>
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
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%);
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
      font-size: 26px;
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
    .feature-grid {
      margin: 28px 0;
    }
    .feature-card {
      background-color: #1A2335;
      border: 1px solid #2C384E;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 14px;
    }
    .feature-title {
      font-size: 15px;
      font-weight: 700;
      color: #F8FAFC;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .feature-desc {
      font-size: 13px;
      color: #94A3B8;
      margin: 0;
      line-height: 1.5;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 20px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #F59E0B 0%, #14B8A6 100%);
      color: #0B0F17 !important;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
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
          Brand<span class="logo-highlight">Flow</span> ✨
        </div>
        <h1 class="hero-title">Welcome to the Future of AI Social Management</h1>
      </div>

      <!-- Main Body -->
      <div class="content-body">
        <p class="greeting">Hello ${fullName || 'Creator'} 👋</p>
        <p class="paragraph">
          Thank you for joining <strong>BrandFlow</strong>! Your brand engine is officially initialized and ready to supercharge your social media workflow across all major channels.
        </p>

        <p class="paragraph" style="margin-bottom: 12px; font-weight: 700; color: #E2E8F0;">
          Here is what you get access to inside your BrandFlow workspace:
        </p>

        <!-- Feature Cards -->
        <div class="feature-grid">
          <div class="feature-card">
            <h3 class="feature-title">🤖 AI Brand Kit Engine</h3>
            <p class="feature-desc">Automatic brand style guide, logo vault, and voice adaptation for consistent posting.</p>
          </div>

          <div class="feature-card">
            <h3 class="feature-title">✍️ Viral Copy & Caption Generator</h3>
            <p class="feature-desc">Instant AI captions tailored for high engagement on Instagram, LinkedIn, X, and Facebook.</p>
          </div>

          <div class="feature-card">
            <h3 class="feature-title">📅 Multi-Platform Smart Scheduler</h3>
            <p class="feature-desc">Schedule, draft, and auto-publish content at peak engagement hours effortlessly.</p>
          </div>

          <div class="feature-card">
            <h3 class="feature-title">🔐 Advanced 2FA Security</h3>
            <p class="feature-desc">Protect your workspace with Google Authenticator / Authy app TOTP 2FA security.</p>
          </div>
        </div>

        <!-- CTA Action -->
        <div class="cta-container">
          <a href="${loginUrl}" class="cta-button">Launch Your Workspace 🚀</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">© ${year} BrandFlow Platform. Enterprise AI Social Management.</p>
        <p style="margin: 0;">If you have any questions, reply to this email or reach out to support@brandflow.ai</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
