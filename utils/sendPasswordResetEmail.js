const nodemailer = require("nodemailer");

const sendPasswordResetEmail = async (email, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Konnect Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Konnect Account Password",
    html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f7f7f7; padding: 30px; border-radius: 8px;">
        <div style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="font-size: 15px; color: #555;">Hi there,</p>
          <p style="font-size: 15px; color: #555;">
            We received a request to reset your Konnect account password. If this was you, click the button below to proceed.
          </p>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
              style="background-color: #007BFF; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px;">
              Reset My Password
            </a>
          </p>

          <p style="font-size: 14px; color: #666;">
            This link will expire in <strong>10 minutes</strong> for your security. If you didn’t request this, please ignore this email or contact support.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 13px; color: #999;">
            If you're having trouble clicking the reset button, copy and paste the URL below into your web browser:
            <br />
            <a href="${resetLink}" style="color: #007BFF;">${resetLink}</a>
          </p>

          <p style="margin-top: 40px; font-size: 14px; color: #444;">Warm regards,<br><strong>The Konnect Team</strong></p>
        </div>

        <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
          © ${new Date().getFullYear()} Konnect. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent successfully");
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendPasswordResetEmail };
