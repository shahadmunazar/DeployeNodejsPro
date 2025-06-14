const nodemailer = require('nodemailer');
const fs = require('fs');
const moment = require('moment');

async function sendConfirmationEmail(useremail, registration, nameOrganization, pdfPath) {
  try {
    console.log("email", nameOrganization);
    const dateTaken = moment(registration.createdAt).format('DD/MM/YYYY');
    const validTo = moment(registration.createdAt).add(1, 'year').format('DD/MM/YYYY');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // HTML email body with ID card section removed
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
            background-color: #f5f5f5;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            margin-bottom: 20px;
          }
          .header h1 {
            font-size: 24px;
            color: #333;
            margin: 0;
            display: inline-block;
          }
          .header .village-text {
            font-size: 14px;
            color: #666;
            margin-left: 10px;
            vertical-align: top;
          }
          .message {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            margin-bottom: 30px;
            text-align: left;
          }
          .details {
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            margin-top: 30px;
            text-align: left;
          }
          .details p {
            margin: 5px 0;
          }
          .details p strong {
            display: inline-block;
            width: 150px;
            font-weight: bold;
          }
          .footer-link {
            margin-top: 20px;
            font-size: 12px;
            color: #007bff;
            text-align: center;
          }
          .footer-link a {
            color: #007bff;
            text-decoration: none;
          }
          .footer-link a:hover {
            text-decoration: underline;
          }
          .signature {
            margin-top: 30px;
            font-size: 14px;
            color: #333;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JAMES MILSON VILLAGE</h1>
            <span class="village-text">VILLAGE</span>
          </div>
          <div class="message">
            <p>Hello ${registration.first_name} ${registration.last_name},</p>
            <p>Thank you for completing the Contractor Induction.</p>
            <p>Please find your induction ID card attached and your confirmed details below.</p>
          </div>
          <div class="details">
            <p><strong>Date Taken:</strong> ${dateTaken}</p>
            <p><strong>Valid To:</strong> ${validTo}</p>
            <p><strong>Name:</strong> ${registration.first_name} ${registration.last_name}</p>
            <p><strong>E-mail Address:</strong> ${useremail}</p>
            <p><strong>Contact Phone Number:</strong> ${registration.mobile_no || 'N/A'}</p>
            <p><strong>Company:</strong> ${nameOrganization}</p>
            <p><strong>Address:</strong> ${registration.address}</p>
          </div>
          <div class="footer-link">
            <p>If you ever need to update your details and manage your completed inductions, you can use the Inductee Portal by <a href="#">clicking here</a>.</p>
            <p><a href="https://www.linksafe.com.au">www.linksafe.com.au</a></p>
          </div>
          <div class="signature">
            <p>Kind regards,</p>
            <p>James Milson Village</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${nameOrganization}" <${process.env.EMAIL_USER}>`,
      to: useremail,
      subject: 'Contractor Registration Confirmation',
      text: `Hello ${registration.first_name} ${registration.last_name},\n\nPlease find your induction ID card attached and your confirmed details below.\n\nDate Taken: ${dateTaken}\nValid To: ${validTo}\n\nName: ${registration.first_name} ${registration.last_name}\nE-mail Address: ${useremail}\nContact Phone Number: ${registration.phone_number || 'N/A'}\nCompany: ${nameOrganization}\nAddress: ${registration.address}\n\nKind regards,\nJames Milson Village`,
      html: htmlBody,
      attachments: [],
    };

    if (pdfPath && fs.existsSync(pdfPath)) {
      mailOptions.attachments.push({
        filename: `identity_card_${registration.first_name}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf',
      });
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${useremail}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

module.exports = sendConfirmationEmail;