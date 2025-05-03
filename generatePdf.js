const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const generatePdf = async (data) => {
  try {
    // Define the path for the EJS template
    const templatePath = path.join(__dirname, 'views/contractor_template.ejs');
    const html = await ejs.renderFile(templatePath, data);

    // Launch Puppeteer to generate the PDF from HTML
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });


    
    // Generate the PDF buffer
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    // Return the PDF buffer directly (no need to save it locally)
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
};

module.exports = generatePdf;
