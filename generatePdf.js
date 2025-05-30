const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const generatePdf = async (data) => {
  try {
    // Path to the EJS template
    const templatePath = path.join(__dirname, 'views/contractor_template.ejs');
    
    // Render the HTML from the EJS template and data
    const html = await ejs.renderFile(templatePath, data);
    
    // Path to Chromium (You can set it to your specific path if needed)
    const chromiumPath = '/usr/bin/chromium-browser'; // Or wherever Chromium is installed
    
    // Launch Puppeteer browser instance with no-sandbox and disable-setuid-sandbox arguments
    const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

    
    // Create a new page and set the rendered HTML content
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate the PDF from the page content
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    // Close the browser instance
    await browser.close();
    
    return pdfBuffer; // Return the PDF buffer
  } catch (error) {
    console.error('❌ Error generating PDF in new:', error);
    throw error;
  }
};

module.exports = generatePdf;
