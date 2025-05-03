const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const generatePdf = async (data) => {
  try {
    const templatePath = path.join(__dirname, 'views/contractor_template.ejs');
    const html = await ejs.renderFile(templatePath, data);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // (Optional) Save locally
    const outputDir = path.join(__dirname, 'generated_pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pdfPath = path.join(outputDir, `contractor_registration_${Date.now()}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    await browser.close();

    return pdfBuffer; // ✅ Return buffer (NOT path)
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
};

module.exports = generatePdf;
