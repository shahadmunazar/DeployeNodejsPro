const User = require("../../../models/user");
const UserRole = require("../../../models/userrole");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const Role = require("../../../models/role"); // adjust the path if needed
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Op } = require("sequelize");

const https = require("https");
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const RefreshToken = require("../../../models/refreshToken")(sequelize, DataTypes);
const { sendPasswordResetEmail } = require("../../../utils/sendPasswordResetEmail");
const Organization = require("../../../models/organization")(sequelize, DataTypes);
const OrganizationSubscribeUser = require("../../../models/organization_subscribeuser")(sequelize, DataTypes);
const emailQueue = require("../../../queues/emailQueue"); // Ensure the emailQueue is correctly imported
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
      attributes: ["id", "name"], // include only needed columns
      order: [["id", "ASC"]], // optional: sort roles by ID
    });

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const SuperAdminLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Token missing" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Find the user
    const admin = await User.findByPk(decoded.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    // Delete refresh token from DB
    const deleted = await RefreshToken.destroy({
      where: {
        userId: admin.id,
        token: token,
      },
    });

    // Update logout timestamp
    await admin.update({
      logout_at: new Date(),
      login_at: null,
    });

    return res.status(200).json({
      message: deleted ? "Admin successfully logged out, refresh token deleted" : "Admin logged out, but no matching refresh token found",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const SendEmailForgetPassword = async (req, res) => {
  try {
    const {newEmail } = req.body;

    
    if ( !newEmail) {
      return res.status(400).json({ message: "Both current email and new email are required" });
    }

    
    const user = await User.findOne({ where: { email:newEmail } });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }


    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  
    await user.update({
      new_email: newEmail,  // Store the new email temporarily
      invite_token: verificationToken,
      invite_expires_at: verificationTokenExpiry,
    });

 
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email-change?token=${verificationToken}`;

   
    await emailQueue.add("send-email-change-verification", {
      to: newEmail,
      subject: "Confirm Your Email Change",
      text: `Click the link to confirm your email change: ${verificationLink}`,
      html: `
      <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f7f7f7; padding: 30px; border-radius: 8px;">
        <div style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #333; margin-bottom: 20px;">Email Change Request</h2>
          <p style="font-size: 15px; color: #555;">Hi ${user.name || "there"},</p>
          <p style="font-size: 15px; color: #555;">
            We received a request to change your account email to ${newEmail}. If this was you, click the button below to confirm the change.
          </p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
              style="background-color: #007BFF; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-size: 16px;">
              Confirm Email Change
            </a>
          </p>
          <p style="font-size: 14px; color: #666;">
            This link will expire in <strong>10 minutes</strong>. If you didn’t request this, please ignore this email.
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 13px; color: #999;">
            Trouble with the button? Paste this link in your browser:<br />
            <a href="${verificationLink}" style="color: #007BFF;">${verificationLink}</a>
          </p>
          <p style="margin-top: 40px; font-size: 14px; color: #444;">Regards,<br><strong>The Konnect Team</strong></p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
          © ${new Date().getFullYear()} Konnect. All rights reserved.
        </div>
      </div>
      `,
    });

 
    return res.status(200).json({
      message: "Email change confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Error in SendEmailChangeEmail:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const ConfirmEmailChange = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    // Find the user by token
    const user = await User.findOne({
      where: { invite_token: token },
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    // Check if the token has expired
    if (new Date() > new Date(user.invite_expires_at)) {
      return res.status(400).json({ message: "Token has expired" });
    }

    // Update the user's email
    await user.update({
      email: user.new_email,  // Update to the new email
      new_email: null,  // Clear the temporary field
      invite_token: null,  // Remove the token
      invite_expires_at: null,  // Remove the expiry
    });

    // Send a success message and maybe notify the user
    await emailQueue.add("send-email-change-success", {
      to: user.email,
      subject: "Your Email Has Been Successfully Updated",
      text: `Hello ${user.name}, your email has been updated to ${user.email}.`,
      html: `
        <html>
          <body>
            <p>Hello ${user.name},</p>
            <p>Your email has been successfully updated to ${user.email}.</p>
            <p>If you did not request this change, please contact support immediately.</p>
          </body>
        </html>
      `,
    });

    return res.status(200).json({ message: "Email changed successfully" });
  } catch (error) {
    console.error("Error in ConfirmEmailChange:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};






const UpdatePasswordBySuperAdmin = async (req, res) => {
  try {
    const { email, current_password, password, confirm_password } = req.body;

    // 🛡 Validate input
    if (!email || !current_password || !password || !confirm_password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ message: "Password and confirm password must match." });
    }

    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }


    const { valid, errors } = validatePassword(password);
    if (!valid) {
      return res.status(400).json({
        message: "Password validation failed.",
        errors,
      });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });

    
    await emailQueue.add("send-password-update-notification", {
      to: user.email,
      subject: "Your Password Has Been Updated",
      text: `Hi ${user.name}, your password has been successfully updated.`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
            <table style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px;">
              <tr>
                <td>
                  <h2 style="color: #007bff;">Password Updated</h2>
                  <p>Hi ${user.name},</p>
                  <p>Your password has been successfully updated. If this wasn't you, please contact our support team immediately.</p>
                  <p>Thanks,<br/>The Support Team</p>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

   
    return res.status(200).json({
      message: "Password updated successfully.",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("UpdatePasswordBySuperAdmin Error:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const API_KEY = process.env.RAPIDAPI_KEY || "your-rapidapi-key";

const GetLocation = async (req, res) => {
  try {
    const address = req.query.address;
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address query parameter is required.",
      });
    }

    const encodedAddress = encodeURIComponent(address);

    const options = {
      method: "GET",
      hostname: "google-map-places.p.rapidapi.com",
      path: `/maps/api/geocode/json?address=${encodedAddress}&language=en&region=en&result_type=administrative_area_level_1&location_type=GEOMETRIC_CENTER`,
      headers: {
        "x-rapidapi-key": API_KEY, // Use the secure API key
        "x-rapidapi-host": "google-map-places.p.rapidapi.com",
      },
    };

    // Make the API request
    const apiReq = https.request(options, apiRes => {
      let data = "";

      // Collect the data chunks
      apiRes.on("data", chunk => {
        data += chunk;
      });

      // Handle the response after receiving all chunks
      apiRes.on("end", () => {
        try {
          const result = JSON.parse(data);

          // Check for a successful response from the API
          if (result.status === "OK") {
            return res.status(200).json({
              success: true,
              address: address,
              locationData: result,
            });
          } else {
            return res.status(404).json({
              success: false,
              message: "Location not found.",
            });
          }
        } catch (err) {
          console.error("Error parsing API response:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to parse response.",
            error: err.message,
          });
        }
      });
    });

    // Handle request errors
    apiReq.on("error", e => {
      console.error("API Request Error:", e.message);
      return res.status(500).json({
        success: false,
        message: "Error contacting Google Maps API",
        error: e.message,
      });
    });

    // End the request
    apiReq.end();
  } catch (error) {
    console.error("Unhandled error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const ProfileUpdate = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      phone: phone ?? user.phone,
      address: address ?? user.address,
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const DashBoard = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);


    const totalOrganizations = await Organization.count();
    const totalSubscribers = await OrganizationSubscribeUser.count();


    const todayOrganizations = await Organization.count({
      where: {
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    const todaySubscribers = await OrganizationSubscribeUser.count({
      where: {
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalOrganizations,
        todayOrganizations,
        totalSubscribers,
        todaySubscribers,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const Activetwofa = async (req, res) => {
  try {
    const userId = req.user?.id; 
    console.log('user',req.user);
    const { is_two_factor_enabled } = req.body;

    if (typeof is_two_factor_enabled !== "boolean") {
      return res.status(400).json({
        status: 400,
        message: "is_two_factor_enabled (true or false) is required.",
      });
    }

    if (!userId) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized. User not logged in.",
      });
    }

    // Find user by ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found.",
      });
    }

    // Update 2FA status
    await user.update({ is_two_factor_enabled });

    return res.status(200).json({
      status: 200,
      message: `Two-factor authentication has been ${is_two_factor_enabled ? "enabled" : "disabled"}.`,
      response: {
        id: user.id,
        email: user.email,
        is_two_factor_enabled: user.is_two_factor_enabled,
      },
    });

  } catch (error) {
    console.error("Activate 2FA Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

 


module.exports = {
  SuperAdminProfile,
  CheckPingSessionActivity,
  ForgetPassword,
  UpdatePassword,
  GetAllRoles,
  GetLocation,
  ProfileUpdate,
  DashBoard,
  SuperAdminLogout,
  SendEmailForgetPassword,
  ConfirmEmailChange,
  UpdatePasswordBySuperAdmin,
  Activetwofa
};
