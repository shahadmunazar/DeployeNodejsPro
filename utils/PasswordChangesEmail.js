const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends confirmation email for successful password change.
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.name
 * @returns {Promise<boolean>}
 */
const PasswordChangesEmail = async ({ email, name }) => {
  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Password Has Been Changed Successfully',
    html: `
      <div style="max-width: 600px; margin: auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; border-radius: 8px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #333;">Hi ${name},</h2>
          <p style="color: #555; font-size: 15px;">
            This email is to confirm that your account password has been successfully changed.
          </p>

          <p style="color: #555; font-size: 15px;">
            If you did not make this change, please contact our support team immediately to ensure your account's security.
          </p>

          <div style="margin-top: 30px;">
            <p style="color: #555; font-size: 14px;">Need help? Contact us at 
              <a href="mailto:support@example.com" style="color: #007BFF;">support@example.com</a>
            </p>
          </div>

          <p style="color: #333; font-size: 14px; margin-top: 40px;">Best regards,<br><strong>Konnect Team</strong></p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #888; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} The Konnect Team. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password change email:', error);
    return false;
  }
};

module.exports = PasswordChangesEmail;
