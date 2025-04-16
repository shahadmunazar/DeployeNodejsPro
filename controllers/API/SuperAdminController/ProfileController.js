const User = require("../../../models/user");
const UserRole = require("../../../models/userrole");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const Role = require('../../../models/role'); // adjust the path if needed
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const RefreshToken = require("../../../models/refreshToken")(sequelize, DataTypes);
const { sendPasswordResetEmail } = require("../../../utils/sendPasswordResetEmail");

const emailQueue = require('../../../queues/emailQueue'); // Ensure the emailQueue is correctly imported
const SuperAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({
      where: { id: userId },
      attributes: {
        exclude: ["password", "otp", "otpExpiresAt", "loginAttemptCount"],
      },
      include: [
        {
          model: Role,
          as: "Roles",
          attributes: ["id", "name"],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const roles = user.Roles.map(role => ({
      id: role.id,
      name: role.name,
    }));

    res.status(200).json({
      success: true,
      message: "Super Admin profile fetched successfully",
      data: {
        user,
        roles,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const validateSession = [body("ActivityStatus").notEmpty().withMessage("ActivityStatus is required").isBoolean().withMessage("ActivityStatus must be a boolean value")];

const CheckPingSessionActivity = async (req, res) => {
  try {
    await Promise.all(validateSession.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { ActivityStatus } = req.body;
    const userId = req.user.id;
    console.log("UserId:", userId);
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["id", "lastActivity", "logout_at"],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (ActivityStatus === false) {
      await user.update({
        logout_at: new Date(),
        lastActivity: new Date(),
      });
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];
      if (token) {
        const deleted = await RefreshToken.destroy({
          where: {
            userId: userId,
            token: token,
          },
        });
        console.log(`Refresh token ${deleted ? "deleted" : "not found"}`);
      } else {
        console.log("No token found in request headers");
      }
      return res.status(200).json({
        success: true,
        message: "User logged out successfully",
        lastActivity: false,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Session is active",
        lastActivity: true,
      });
    }
  } catch (error) {
    console.error("Error checking session activity:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const validateEmail = [body("email").isEmail().withMessage("Please provide a valid email address.").normalizeEmail()];

const ForgetPassword = async (req, res) => {
  try {
    await Promise.all(validateEmail.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.update({
      invite_token: resetToken,
      invite_expires_at: resetTokenExpiry,
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);
    res.status(200).json({ success: true, message: "Password reset email sent." });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const validatePassword = [
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(/\d/)
    .withMessage("Password must contain at least one number.")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character."),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Password confirmation does not match password."),
];

const UpdatePassword = async (req, res) => {
  try {
    await Promise.all(validatePassword.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { token, password } = req.body;
    console.log("invitesToken", token);
    const user = await User.findOne({
      where: {
        invite_token: token,
      },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }
    console.log("Stored invite_token:", user.invite_token);
    console.log("Stored invite_expires_at:", user.invite_expires_at);
    if (new Date(user.invite_expires_at) <= new Date()) {
      return res.status(400).json({ success: false, message: "Token has expired." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      password: hashedPassword,
      invite_token: null,
      invite_expires_at: null,
      passwordChanged: true,
    });
    res.status(200).json({
      success: true,
      message: "Your password has been changed successfully. You can now log in with your new credentials.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};


const GetAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name'], // include only needed columns
      order: [['id', 'ASC']] // optional: sort roles by ID
    });

    return res.status(200).json({
      success: true,
      message: 'Roles fetched successfully',
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};



const SuperAdminLogout = async(req,res)=>{
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }
  
    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  
    // Find the user
    const admin = await User.findByPk(decoded.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
  
    // Delete refresh token from DB
    const deleted = await RefreshToken.destroy({
      where: {
        userId: admin.id,
        token: token
      }
    });
  
    // Update logout timestamp
    await admin.update({
      logout_at: new Date(),
      login_at: null
    });
  
  
    return res.status(200).json({
      message: deleted
        ? 'Admin successfully logged out, refresh token deleted'
        : 'Admin logged out, but no matching refresh token found',
    });
  
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

const SendEmailForgetPassword = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findByPk(id); // Ensure 'User' model is correctly imported
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token and set its expiry time
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // Token expiry time set to 10 minutes

    // Update user record with reset token and its expiry
    await user.update({
      invite_token: resetToken,
      invite_expires_at: resetTokenExpiry,
    });

    // Prepare the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Add a job to the email queue to send the reset email
    await emailQueue.add('send-password-reset', {
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click on the link to reset your password: ${resetLink}`,
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
    });

    // Respond to the client
    return res.status(200).json({
      message: 'Password reset email has been sent.',
    });

  } catch (error) {
    console.error('Error in SendEmailForgetPassword:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const UpdatePasswordBySuperAdmin = async (req, res) => {
  try {
    const { id, password, confirm_password } = req.body;

    // 1. Validate input fields
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    if (!password || !confirm_password) {
      return res.status(400).json({ message: 'Password and confirm password are required' });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: 'Password and confirm password must match' });
    }

    // 2. Find the user by ID
    const user = await User.findByPk(id); // Ensure 'User' model is correctly imported
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update the user's password
    await user.update({ password: hashedPassword });

    // 5. Add email job to the queue to notify the user
    await emailQueue.add('send-password-update-notification', {
      to: user.email,
      subject: 'Your Password Has Been Updated Successfully',
      text: `
        Dear ${user.name},
    
        Your password has been successfully updated. If you did not request this change, please contact our support team immediately at support@yourdomain.com.
    
        Thank you,
        The Support Team`,
      html: `
        <html>
          <head>
            <style>
              /* General styles */
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
                color: #333;
              }
              table {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                padding: 20px;
              }
              td {
                padding: 10px;
                line-height: 1.6;
              }
    
              h2 {
                color: #007bff;
                font-size: 24px;
                font-weight: bold;
              }
    
              p {
                font-size: 16px;
                color: #333;
              }
    
              a {
                color: #007bff;
                text-decoration: none;
              }
    
              .footer {
                font-size: 12px;
                color: #bbb;
                text-align: center;
                margin-top: 20px;
              }
    
              .footer a {
                color: #007bff;
              }
    
              .alert {
                font-weight: bold;
                color: #d9534f;
              }
    
              /* Responsive styles for smaller devices */
              @media (max-width: 600px) {
                table {
                  width: 100%;
                  padding: 10px;
                }
    
                h2 {
                  font-size: 20px;
                }
    
                p {
                  font-size: 14px;
                }
    
                .footer {
                  font-size: 10px;
                }
              }
            </style>
          </head>
          <body>
            <table>
              <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                  <img src="https://yourdomain.com/logo.png" alt="Your Company" style="max-width: 150px; margin-bottom: 10px;" />
                  <h2>Your Password Has Been Updated</h2>
                </td>
              </tr>
    
              <tr>
                <td>
                  <p>Dear ${user.name},</p>
                  <p>Your password has been successfully updated.</p>
                  <p class="alert">If you did not request this change, please contact us immediately at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>
                  <p>For your security, please make sure this update was done by you. If you believe your account has been compromised, we'll assist you in resolving it.</p>
                </td>
              </tr>
    
              <tr>
                <td class="footer">
                  <p>If you have any questions or concerns, feel free to reach out to us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a>.</p>
                  <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
    

    // 6. Return a success message
    return res.status(200).json({
      message: 'Password updated successfully',
      user: { id: user.id, email: user.email },
    });

  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};
module.exports = { SuperAdminProfile, CheckPingSessionActivity, ForgetPassword, UpdatePassword,GetAllRoles,SuperAdminLogout,SendEmailForgetPassword,UpdatePasswordBySuperAdmin };
