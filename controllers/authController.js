const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
require("dotenv").config();
const moment = require("moment");
const emailQueue = require("../queues/emailQueue");

const requestIp = require("request-ip");
const useragent = require("useragent");
const User = require("../models/user");
const UserRole = require("../models/userrole");
const Role = require("../models/role");
const sequelize = require("../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const RefreshToken = require("../models/refreshToken")(sequelize, DataTypes);
const UserLogin = require("../models/user_logins");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const blacklist = new Set(); // Temporary blacklist (or use Redis for persistence)

// ========================== LOGIN FUNCTION ==========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Input validation
    if (!email) {
      return res.status(403).json({ status: 403, message: "Email or username is required." });
    }
    if (!password) {
      return res.status(403).json({ status: 403, message: "Password is required." });
    }

    // 2. Get user(s) where either email or username matches
    const potentialUsers = await User.findAll({
      where: {
        [Op.or]: [{ email: email }, { username: email }],
      },
    });

    // 3. Case-sensitive match (exact match to username or email)
    const user = potentialUsers.find(u => u.email === email || u.username === email);

    if (!user) {
      return res.status(403).json({
        status: 403,
        message: "No account found with the provided email or username.",
      });
    }

    // 4. Check if account is locked
    if (!user.user_status) {
      return res.status(403).json({
        status: 403,
        message: "Account is locked. Contact support.",
      });
    }

    // 5. Check password (bcrypt is case-sensitive)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await user.increment("loginAttemptCount");
      await user.reload();

      if (user.loginAttemptCount >= 5) {
        await user.update({ loginAttemptCount: 0, user_status: false });
        return res.status(403).json({
          status: 403,
          message: "Too many failed attempts. Account is now locked.",
        });
      }

      if (user.loginAttemptCount >= 3) {
        return res.status(403).json({
          showcaptcha: true,
          status: 403,
          message: "Too many failed attempts. Please verify the Captcha.",
        });
      }

      return res.status(403).json({ status: 403, message: "Incorrect password." });
    }

    // 6. Reset login attempts
    await user.update({ loginAttemptCount: 0 });

    // 7. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.update({ otp, otpExpiresAt });

    // 8. Send OTP email
    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      status: 200,
      message: "OTP has been sent to your email. Please verify to complete login.",
      requiresOtp: true,
      userId: user.id,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// ========================== OTP EMAIL FUNCTION ==========================
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

// ========================== VERIFY OTP FUNCTION ==========================
const verifyOtp = async (req, res) => {
  try {
    console.log("Verify OTP request:", req.body);
    let { email, username, otp } = req.body;

    // Ensure only one field is provided
    if ((email && username) || (!email && !username)) {
      return res.status(400).json({ message: "Provide only one: either email or username" });
    }

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    // Ensure OTP is an integer
    otp = parseInt(otp.toString().trim(), 10);

    // Find user
    const whereClause = email ? { email } : { username };
    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.user_status === false) {
      return res.status(400).json({
        message: "Account Locked Due to Too Many Failed Attempts. Please Contact Admin",
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP is missing or invalid" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const storedOtp = parseInt(user.otp, 10);
    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    //
    const clientIp = requestIp.getClientIp(req) || "Unknown IP";
    const agent = useragent.parse(req.headers["user-agent"]);
    const device = agent.device.toString() || "Unknown Device";
    const browser = agent.family || "Unknown Browser";
    const loginTime = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log("Login Ip", clientIp);
    // Update last_login timestamp
    await user.update({
      login_at: loginTime,
      otp: null,
      otpExpiresAt: null,
    });

    // Insert login record
    await UserLogin.create({
      user_id: user.id,
      ip_address: clientIp,
      device: device,
      browser: browser,
      user_agent: req.headers["user-agent"],
      login_at: loginTime,
    });

    // Fetch user roles
    const userRoles = await UserRole.findAll({ where: { userId: user.id } });
    const roles = userRoles.length
      ? await Promise.all(
          userRoles.map(async ur => {
            const role = await Role.findByPk(ur.roleId);
            return role ? role.name : null;
          })
        )
      : [];

    // Generate JWT token with roles
    const token = jwt.sign({ id: user.id, username: user.username, roles }, "your_secret_key", { expiresIn: "30d" });

    const refreshToken = jwt.sign(
      { id: user.id, username: user.username, roles },
      "your_secret_key",
      { expiresIn: "30d" } // Longer-lived refresh token
    );

    // Save refresh token in DB
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.json({
      message: "OTP verified successfully. Logged In!",
      status: 200,
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        last_login: loginTime, // Return last login time
      },
      roles,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ========================== GET CURRENT USER FUNCTION ==========================
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ["id", "name", "email"] });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRoles = await UserRole.findAll({ where: { userId: user.id } });
    const roles = await Promise.all(
      userRoles.map(async ur => {
        const role = await Role.findByPk(ur.roleId);
        return role ? role.name : null;
      })
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: roles.filter(role => role !== null),
        token: req.header("Authorization"),
      },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const CreateAdminLogout = async (req, res) => {
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

const GetUserProfile = async (req, res) => {
  try {
    // Assuming req.user is set from auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Token is missing or invalid" });
    }

    // Fetch user details along with roles
    const user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["password"] }, // exclude sensitive data
      include: [
        {
          model: Role,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ========================== EXPORT FUNCTIONS ==========================
module.exports = { login, verifyOtp, getCurrentUser, CreateAdminLogout, GetUserProfile };
