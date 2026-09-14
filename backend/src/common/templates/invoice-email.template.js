/**
 * High-End HTML Invoice Email Template for BrandFlow
 * @param {{ fullName: string, planName: string, postCount: number, pricePaid: number, currency: string, paymentGateway: string, invoiceNum: string, dashboardUrl: string }} params
 */
export function renderInvoiceEmail({
  fullName,
  planName,
  postCount,
  pricePaid,
  currency,
  paymentGateway,
  invoiceNum,
  dashboardUrl,
}) {
  const year = new Date().getFullYear();
  const currencySym = currency === 'USD' ? '$' : '₹';
  const priceDisplay = pricePaid > 0 ? `${currencySym}${pricePaid.toFixed(2)}` : 'FREE ($0.00)';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your BrandFlow Invoice</title>
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
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(245, 158, 11, 0.15) 100%);
      padding: 36px 30px;
      text-align: center;
      border-bottom: 1px solid #2C384E;
    }
    .logo-badge {
      display: inline-block;
      padding: 8px 18px;
      background: #0B0F17;
      border: 1px solid #4F46E5;
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
    .invoice-details-box {
      background-color: #0B0F17;
      border: 1px solid #2C384E;
      border-radius: 14px;
      padding: 20px;
      margin: 24px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #1E293B;
      font-size: 13px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #94A3B8;
    }
    .detail-value {
      color: #F8FAFC;
      font-weight: 700;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 20px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #4F46E5 0%, #F59E0B 100%);
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
    }
    .footer {
      padding: 24px 30px;
      background-color: #0B0F17;
      border-top: 1px solid #2C384E;
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
          Brand<span class="logo-highlight">Flow</span> 🧾
        </div>
        <h1 class="hero-title">Subscription Invoice & Confirmation</h1>
      </div>

      <!-- Main Body -->
      <div class="content-body">
        <p class="greeting">Hello ${fullName || 'Valued Partner'} 👋</p>
        <p class="paragraph">
          Thank you for choosing BrandFlow! Your subscription plan has been updated successfully. Your official invoice is attached to this email as a PDF document for your accounting records.
        </p>

        <!-- Invoice Summary Box -->
        <div class="invoice-details-box">
          <div class="detail-row">
            <span class="detail-label">Invoice Number</span>
            <span class="detail-value">${invoiceNum}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Plan / Grant Type</span>
            <span class="detail-value" style="color: #F59E0B;">${planName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Post Quota Granted</span>
            <span class="detail-value">+${postCount} Posts</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Gateway</span>
            <span class="detail-value">${paymentGateway}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Amount</span>
            <span class="detail-value" style="color: #10B981;">${priceDisplay}</span>
          </div>
        </div>

        <!-- CTA Action -->
        <div class="cta-container">
          <a href="${dashboardUrl}" class="cta-button">Open BrandFlow Studio 🚀</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">© ${year} BrandFlow Platform. Autonomous Social Media Manager.</p>
        <p style="margin: 0;">If you have any questions about this receipt, contact us at billing@brandflow.app</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
