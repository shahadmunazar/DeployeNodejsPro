const puppeteer = require('puppeteer');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs');

const generatePdf = async (data) => {
  try {
    // Path to the EJS template
    const templatePath = path.join(__dirname, 'views/contractor_template.ejs');
    
    // Render the HTML from the EJS template and data
    const html = await ejs.renderFile(templatePath, data);
    
    // Launch Puppeteer browser instance with `--no-sandbox` if required
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page and set the rendered HTML content
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
   
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    
    await browser.close();
    
    return pdfBuffer; 
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = generatePdf;
