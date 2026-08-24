/**
 * High-End HTML Email Template for Post Published Alert
 * @param {{ fullName: string, postTitle: string, targetPlatforms: string[], platformResults: Object, publishedAt: string }} params
 */
export function renderPostPublishedEmail({
  fullName,
  postTitle,
  targetPlatforms = [],
  platformResults = {},
  publishedAt,
}) {
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post Published Successfully</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0B0F17;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);
      padding: 32px 30px;
      text-align: center;
      border-bottom: 1px solid #2C384E;
    }
    .logo-badge {
      display: inline-block;
      padding: 6px 16px;
      background: #0B0F17;
      border: 1px solid #10B981;
      border-radius: 30px;
      font-weight: 800;
      font-size: 14px;
      color: #10B981;
      margin-bottom: 10px;
    }
    .hero-title {
      margin: 8px 0 0 0;
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .content-body {
      padding: 30px;
    }
    .post-box {
      background-color: #0B0F17;
      border: 1px solid #2C384E;
      border-radius: 14px;
      padding: 18px;
      margin: 20px 0;
    }
    .platform-item {
      padding: 10px;
      background-color: #1A2335;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .platform-link {
      color: #F59E0B;
      text-decoration: none;
      font-weight: 700;
    }
    .footer {
      padding: 20px 30px;
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
      <div class="header-banner">
        <div class="logo-badge">
          ✅ PUBLISHED LIVE
        </div>
        <h1 class="hero-title">Your Social Post is Live Across Channels! 🎉</h1>
      </div>

      <div class="content-body">
        <p style="font-size: 16px; font-weight: 700; color: #F59E0B; margin-top: 0;">
          Hi ${fullName || 'Creator'} 👋
        </p>

        <p style="font-size: 14px; color: #94A3B8; line-height: 1.6;">
          Great news! Your post <strong>"${postTitle || 'Social Media Graphic'}"</strong> was published successfully on ${new Date(publishedAt).toLocaleString()}.
        </p>

        <div class="post-box">
          <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748B; margin: 0 0 10px 0;">
            Target Platforms & Links:
          </p>

          ${targetPlatforms
            .map((p) => {
              const res = platformResults[p] || {};
              const link = res.postUrl || '#';
              return `
              <div class="platform-item">
                <strong style="color: #FFFFFF;">${p}</strong>:
                <a href="${link}" class="platform-link" target="_blank">${link}</a>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0;">© ${year} BrandFlow Platform. Automated Publishing Notification.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
