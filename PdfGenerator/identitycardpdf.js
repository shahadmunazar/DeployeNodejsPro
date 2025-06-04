const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");

const IdentityCardPdf = async pdfData => {
  try {
    console.log("Generating PDF for data:", pdfData);

    const outputDir = path.join(__dirname, "..", "generated_pdfs");
    const fileName = `identity_card_${pdfData.name || "unknown"}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    // 🗑️ Always remove existing file (optional)
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      console.log(`🗑️ Removed existing PDF for contractor ${pdfData.name}`);
    }

    const templatePath = path.join(__dirname, "..", "views", "identity_card.ejs");
    const html = await ejs.renderFile(templatePath, {
      registration: {
        first_name: pdfData.name || "",
        last_name: "",
        userId: pdfData.userId || "",
        phone_number: pdfData.phone_number,
        expiry_date: pdfData.expiry_date,
        created_at: pdfData.created_at,
      },
      nameOrganization: pdfData.company_name || "",
      useremail: pdfData.useremail || "",
      moment: require("moment"),
    });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    console.log(`✅ PDF generated and saved at ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    throw err;
  }
};

module.exports = IdentityCardPdf;
