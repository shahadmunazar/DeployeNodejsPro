const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends onboarding email with activation link and temp password.
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.name
 * @param {string} params.tempPassword
 * @param {string} params.orgName
 * @returns {Promise<boolean>}
 */
const sendOnboardingEmail = async ({ email, name, tempPassword, orgName }) => {
  const FRONTEND_URL = process.env.FRONTEND_URL;
  const activationLink = `${FRONTEND_URL}/${orgName}/login`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Our Platform – Activate Your Account',
    html: `
      <h2>Welcome ${name},</h2>
      <p>Thank you for joining our platform! Please use the details below to activate your account:</p>
      <ul>
        <li><strong>Email ID:</strong> ${email}</li>
        <li><strong>Temporary Password:</strong> ${tempPassword}</li>
        <li><strong>Activation Link:</strong> <a href="${activationLink}">${activationLink}</a></li>
      </ul>
      <p>This link and temporary password will expire in 24 hours for security reasons.</p>
      <p>If you need help, please contact support.</p>
      <br />
      <p>Best regards,<br />The Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('❌ Failed to send onboarding email:', error);
    return false;
  }
};

module.exports = sendOnboardingEmail;
