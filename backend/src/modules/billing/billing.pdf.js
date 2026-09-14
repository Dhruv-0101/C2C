import PDFDocument from 'pdfkit';

/**
 * Generate a clean, minimal PDF invoice/receipt buffer
 * @param {Object} tx - Billing transaction record from database
 * @param {Object} user - User record
 * @param {Object} brandKit - BrandKit profile (optional)
 * @returns {Promise<Buffer>} - Resolves with PDF file Buffer
 */
export const buildInvoicePdfBuffer = (tx, user, brandKit = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `BrandFlow Invoice ${tx.id.substring(0, 8)}`,
          Author: 'BrandFlow',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#4F46E5'; // Indigo
      const secondaryColor = '#D97706'; // Amber
      const darkColor = '#0F172A'; // Slate 900
      const mutedColor = '#64748B'; // Slate 500
      const borderColor = '#E2E8F0'; // Slate 200
      const lightBg = '#F8FAFC'; // Slate 50

      const issueDate = tx.createdAt
        ? new Date(tx.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : new Date().toLocaleDateString('en-US');

      const invoiceNum = `INV-${new Date(tx.createdAt || Date.now()).toISOString().slice(0, 10).replace(/-/g, '')}-${tx.id.substring(0, 6).toUpperCase()}`;

      // ==========================================
      // 1. HEADER SECTION
      // ==========================================
      // Brand Logo & Subtitle (Left)
      doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text('BrandFlow', 40, 40);
      doc.fontSize(8.5).font('Helvetica').fillColor(mutedColor).text('AI Social Media Platform', 40, 65);

      // Invoice Title & Details Right Aligned Block (x=330, width=225)
      doc.fontSize(16).font('Helvetica-Bold').fillColor(darkColor).text('INVOICE', 330, 40, { width: 225, align: 'right' });

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(mutedColor).text('INVOICE NO:', 330, 62);
      doc.font('Helvetica-Bold').fillColor(darkColor).text(invoiceNum, 410, 62, { width: 145, align: 'right' });

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(mutedColor).text('DATE:', 330, 75);
      doc.font('Helvetica').fillColor(darkColor).text(issueDate, 410, 75, { width: 145, align: 'right' });

      // Horizontal Divider Line
      doc.moveTo(40, 95).lineTo(555, 95).strokeColor(borderColor).lineWidth(1).stroke();

      // ==========================================
      // 2. BILLED FROM & BILLED TO GRID
      // ==========================================
      const gridTop = 110;

      // Left Column: Billed From (BrandFlow)
      doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('BILLED FROM', 40, gridTop);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkColor).text('BrandFlow', 40, gridTop + 15);
      doc.fontSize(8.5).font('Helvetica').fillColor(mutedColor);
      doc.text('Email: billing@brandflow.app', 40, gridTop + 30);
      doc.text('Website: https://brandflow.app', 40, gridTop + 43);

      // Right Column: Billed To (Customer)
      doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryColor).text('BILLED TO', 310, gridTop);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkColor).text(user?.fullName || 'User', 310, gridTop + 15);

      let currentBilledToY = gridTop + 30;
      if (brandKit?.businessName) {
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor(secondaryColor).text(`Business: ${brandKit.businessName}`, 310, currentBilledToY);
        currentBilledToY += 13;
      }
      doc.fontSize(8.5).font('Helvetica').fillColor(mutedColor);
      doc.text(`Email: ${user?.email || 'N/A'}`, 310, currentBilledToY);

      // ==========================================
      // 3. PAYMENT REFERENCE INFO BOX
      // ==========================================
      const boxTop = 185;
      doc.roundedRect(40, boxTop, 515, 45, 6).fillAndStroke(lightBg, borderColor);

      doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedColor).text('PAYMENT GATEWAY', 55, boxTop + 10);
      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkColor).text(tx.paymentGateway || 'FREE', 55, boxTop + 24);

      doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedColor).text('TRANSACTION REF ID', 180, boxTop + 10);
      const refId = tx.paymentId || tx.orderId || 'admin_grant_audit';
      doc.fontSize(9).font('Helvetica-Bold').fillColor(darkColor).text(refId, 180, boxTop + 24);

      doc.fontSize(8).font('Helvetica-Bold').fillColor(mutedColor).text('PAYMENT STATUS', 420, boxTop + 10);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#059669').text('COMPLETED', 420, boxTop + 24);

      // ==========================================
      // 4. ITEM TABLE
      // ==========================================
      const tableTop = 250;

      // Table Header Row
      doc.rect(40, tableTop, 515, 24).fill('#F1F5F9');
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(darkColor);
      doc.text('DESCRIPTION / PLAN TYPE', 50, tableTop + 7);
      doc.text('POST QUOTA', 270, tableTop + 7);
      doc.text('GATEWAY', 370, tableTop + 7);
      doc.text('AMOUNT', 445, tableTop + 7, { width: 100, align: 'right' });

      // Table Line Item Row
      const rowTop = tableTop + 30;
      let planDesc = 'BrandFlow Free Starter Plan Activation';
      if (tx.transactionType === 'ADMIN_BONUS' || tx.paymentGateway === 'ADMIN_BONUS') {
        planDesc = 'Admin Bonus Post Quota Top-Up';
      } else if (tx.plan === 'PRO') {
        planDesc = `BrandFlow Pro Plan Subscription (${tx.postCount} Posts)`;
      }

      const currencySym = tx.currency === 'USD' ? '$' : '₹';
      const formattedPrice = tx.pricePaid > 0 ? `${currencySym}${tx.pricePaid.toFixed(2)}` : 'FREE ($0.00)';

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(darkColor).text(planDesc, 50, rowTop, { width: 210 });
      doc.fontSize(8.5).font('Helvetica').fillColor(mutedColor).text(`+${tx.postCount || 5} Posts`, 270, rowTop);
      doc.text(tx.paymentGateway || 'FREE', 370, rowTop);
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(darkColor).text(formattedPrice, 445, rowTop, { width: 100, align: 'right' });

      // Row Underline Line
      doc.moveTo(40, rowTop + 22).lineTo(555, rowTop + 22).strokeColor(borderColor).stroke();

      // ==========================================
      // 5. SUMMARY TOTAL
      // ==========================================
      const summaryTop = rowTop + 35;

      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('TOTAL PAID:', 340, summaryTop);
      doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text(formattedPrice, 445, summaryTop, { width: 100, align: 'right' });

      // ==========================================
      // 6. FOOTER
      // ==========================================
      const footerTop = 720;
      doc.moveTo(40, footerTop).lineTo(555, footerTop).strokeColor(borderColor).stroke();

      doc.fontSize(8).font('Helvetica-Bold').fillColor(darkColor).text('Digital Verification:', 40, footerTop + 10);
      doc.fontSize(7.5).font('Helvetica').fillColor(mutedColor).text(
        'This is an official computer-generated receipt issued by BrandFlow.',
        40,
        footerTop + 22,
        { width: 515 }
      );

      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(primaryColor).text('Support: ', 40, footerTop + 38);
      doc.font('Helvetica').fillColor(mutedColor).text('billing@brandflow.app | https://brandflow.app', 80, footerTop + 38);

      // Finalize PDF Document
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
