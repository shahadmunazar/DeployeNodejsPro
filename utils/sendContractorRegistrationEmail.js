const nodemailer = require("nodemailer");
const generatePdf = require("../generatePdf");

module.exports = async function sendContractorRegistrationEmail(data) {
  const { registration } = data;
  const recipientEmail = data.invitation?.contractor_email;
    console.log("Reception Email",recipientEmail);
  try {
    const pdfBuffer = await generatePdf(data);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: "Contractor Registration Details",
      text: `Hi ${registration.contractor_company_name || 'Contractor'},\n\nPlease find attached your registration details PDF.\n\nBest,\nTeam`,
      attachments: [{
        filename: 'contractor-registration.pdf',
        content: pdfBuffer
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Error sending contractor registration email:", error);
  }
};
