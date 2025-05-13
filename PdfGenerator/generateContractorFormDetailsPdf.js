const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const generateContractorFormDetailsPdf = async (data, contractorId) => {
  try {
    const outputDir = path.join(__dirname, '..', 'generated_pdfs');
    const fileName = `contractor_form_details_${contractorId}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    if (fs.existsSync(outputPath)) {
      console.log(`📄 PDF already exists for contractor ${contractorId}`);
      return outputPath;
    }

    const templatePath = path.join(__dirname, '..', 'views', 'contractor_form_details.ejs');
    const html = await ejs.renderFile(templatePath, data);

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    console.log(`✅ PDF generated and saved at ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error('❌ PDF generation failed:', err);
    throw err;
  }
};

module.exports = generateContractorFormDetailsPdf;
