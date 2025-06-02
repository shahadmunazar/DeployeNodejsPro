// helpers/emailHelper.js
const emailQueue = require("../queues/emailQueue"); // Path should match your project structure
const moment = require('moment');

const sendConfirmationEmail = async (useremail, findDetails, nameOrganization) => {
  try {
    const emailTemplate = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .email-container {
              width: 100%;
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
            }
            .header {
              background-color: #1a2526;
              color: #ffffff;
              padding: 15px 20px;
              text-align: left;
            }
            .header h2 {
              margin: 0;
              font-size: 20px;
            }
            .content {
              padding: 20px;
              color: #333333;
              font-size: 14px;
              line-height: 1.6;
            }
            .content p {
              margin: 5px 0;
            }
            .content a {
              color: #007bff;
              text-decoration: none;
            }
            .content a:hover {
              text-decoration: underline;
            }
            .details {
              margin-top: 20px;
            }
            .details p {
              margin: 5px 0;
            }
            .details strong {
              display: inline-block;
              width: 120px;
              font-weight: bold;
            }
            .footer {
              background-color: #1a2526;
              color: #cccccc;
              padding: 10px 20px;
              text-align: right;
              font-size: 12px;
            }
            .footer a {
              color: #cccccc;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h2>${nameOrganization}</h2>
            </div>
            <div class="content">
              <p>Hello ${findDetails.first_name} ${findDetails.last_name},</p>
              <p>Thank you for completing your contractor registration. Please find your registration details below.</p>
              <div class="details">
                <p><strong>ID:</strong> ${findDetails.id}</p>
                <p><strong>Date:</strong> ${moment().format("DD/MM/YYYY")}</p>
                <p><strong>Name:</strong> ${findDetails.first_name} ${findDetails.last_name}</p>
                <p><strong>Email:</strong> ${findDetails.email}</p>
                <p><strong>Mobile:</strong> ${findDetails.mobile_no}</p>
                <p><strong>Company:</strong> ${findDetails.organization_name}</p>
                <p><strong>Trade Types:</strong> ${findDetails.trade_type.join(", ")}</p>
                <p><strong>Invited by:</strong> ${nameOrganization}</p>
              </div>
              <p>
                If you ever need to update your details or manage your account, you can use the portal by clicking here:
                <a href="https://yourdomain.com/login">Login to Portal</a>
              </p>
              <p><strong>PLEASE DO NOT REPLY DIRECTLY TO THIS EMAIL</strong></p>
            </div>
            <div class="footer">
              Powered by <a href="https://linksafe.com">LinkSafe</a>
            </div>
          </div>
        </body>
      </html>
    `;

    // Add the email job to the queue
    await emailQueue.add("send-confirmation", {
      to: useremail,
      subject: "Contractor Registration Confirmation",
      text: `Hello ${findDetails.first_name} ${findDetails.last_name},\n\nThank you for completing your contractor registration with ${nameOrganization}. Here are your details:\n\nID: ${findDetails.id}\nDate: ${moment().format("DD/MM/YYYY")}\nName: ${findDetails.first_name} ${findDetails.last_name}\nEmail: ${findDetails.email}\nMobile: ${findDetails.mobile_no}\nCompany: ${findDetails.organization_name}\nTrade Types: ${findDetails.trade_type.join(", ")}\nInvited by: ${nameOrganization}\n\nLogin to the portal: https://yourdomain.com/login\n\nPlease do not reply directly to this email.\n\nPowered by LinkSafe`,
      html: emailTemplate,
    });

    console.log(`Confirmation email job added to queue for ${useremail}`);
  } catch (error) {
    console.error("Failed to add email job to queue:", error.message);
    throw error; // Propagate error to the caller
  }
};

module.exports = {
  sendConfirmationEmail,
};