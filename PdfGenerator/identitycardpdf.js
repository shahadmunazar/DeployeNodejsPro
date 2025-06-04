const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const IdentityCardPdf = async (pdfData) => {
  try {
    console.log("Generating PDF for data:", pdfData);

    const outputDir = path.join(__dirname, '..', 'generated_pdfs');
    const fileName = `identity_card_${pdfData.name || 'unknown'}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    // Return if PDF already exists
    if (fs.existsSync(outputPath)) {
      console.log(`📄 PDF already exists for contractor ${pdfData.name}`);
      return outputPath;
    }

    // Render EJS template to HTML
    const templatePath = path.join(__dirname, '..', 'views', 'identity_card.ejs');
    const html = await ejs.renderFile(templatePath, {
      registration: {
        first_name: pdfData.name || '',
        last_name: '', // If you have last name, add here
        userId: pdfData.userId || '',
        phone_number: pdfData.phone_number, // Optional: add if available
        expiry_date: pdfData.expiry_date || '',
      },
      nameOrganization: pdfData.company_name || '',
      useremail: pdfData.useremail || '',
    });

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
    });
    await browser.close();

    console.log(`✅ PDF generated and saved at ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error('❌ PDF generation failed:', err);
    throw err;
  }
};

module.exports = IdentityCardPdf;
