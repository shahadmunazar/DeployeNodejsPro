const nodemailer = require("nodemailer");
const generatePdf = require("../generatePdf");

module.exports = async function sendContractorRegistrationEmail(data) {
  const { registration } = data;
  const recipientEmail = data.invitation?.contractor_email;
  console.log("Recipient Email", recipientEmail);

  try {
    // Generate PDF buffer
    const pdfBuffer = await generatePdf(data);

    // Configure the email transport using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS   
      }
    });

    // Prepare the email options
    const mailOptions = {
      from: `"Your Company" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: "Contractor Registration Details",
      text: `Hi ${registration.contractor_company_name || 'Contractor'},\n\nPlease find attached your registration details PDF.\n\nBest,\nTeam`,
      attachments: [
        {
          filename: `contractor-registration-${String(registration.id).padStart(4, '0')}.pdf`, // PDF filename with contractor ID
          content: pdfBuffer
        }
      ]
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Error sending contractor registration email:", error);
  }
};
