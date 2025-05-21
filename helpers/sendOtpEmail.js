// helpers/emailHelper.js

const emailQueue = require("../queues/emailQueue"); // Ensure the emailQueue is correctly imported

const sendOtpEmail = async (userEmail, otp) => {
  try {
    const emailTemplate = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              margin: 0;
              padding: 0;
            }
            .email-container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
            }
            .header h2 {
              color: #4CAF50;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #333333;
              margin-top: 20px;
              padding: 20px;
              background-color: #e7f9e7;
              border-radius: 8px;
              text-align: center;
            }
            .footer {
              margin-top: 40px;
              font-size: 14px;
              color: #777777;
              text-align: center;
            }
            .footer a {
              color: #4CAF50;
              text-decoration: none;
            }
            .button {
              background-color: #4CAF50;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h2>OTP Verification for Login</h2>
              <p>We received a request to log in to your account.</p>
            </div>
            <div class="otp-code">
              <p>Your OTP code is:</p>
              <h1>${otp}</h1>
            </div>
            <p style="text-align: center; color: #333333;">
              This code will expire in 10 minutes. Please do not share this OTP with anyone.
            </p>
            <div class="footer">
              <p>If you didn't request this, please ignore this email.</p>
              <p>For more help, <a href="mailto:support@yourdomain.com">contact support</a>.</p>
              <p>Thank you for using our service!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Add the email job to the queue
    await emailQueue.add("send-otp", {
      to: userEmail,
      subject: "Your OTP Code",
      text: `Your OTP for login is: ${otp}`,
      html: emailTemplate,
    });

    console.log(`OTP job added to queue for ${userEmail}`);
  } catch (error) {
    console.error("Failed to add email job to queue:", error.message);
  }
};

module.exports = {
  sendOtpEmail,
};
