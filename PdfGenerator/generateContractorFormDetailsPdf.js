const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf-node');

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

    const file = { content: html };
    const options = { format: 'A4' };
    const pdfBuffer = await pdf.generatePdf(file, options);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`✅ PDF generated and saved at ${outputPath}`);

    return outputPath;
  } catch (err) {
    console.error('❌ PDF generation failed:', err);
    throw err;
  }
};

module.exports = generateContractorFormDetailsPdf;
