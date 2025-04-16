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
module.exports = { SuperAdminProfile, CheckPingSessionActivity, ForgetPassword, UpdatePassword,GetAllRoles,SuperAdminLogout };
