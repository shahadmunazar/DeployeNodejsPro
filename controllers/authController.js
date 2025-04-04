const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
require("dotenv").config();
const moment = require("moment");
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
    const { email, username, password } = req.body;
    if (!email && !username) {
      return res.status(400).json({ message: "Email or username is required" });
    }
    const whereClause = {};
    if (email) whereClause.email = email;
    if (username) whereClause.username = username;
    const user = await User.findOne({ where: whereClause });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.user_status === "locked") {
      return res.status(403).json({ message: "Account locked due to too many failed attempts." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await user.increment("loginAttemptCount");
      await user.reload();
      if (user.loginAttemptCount >= 5) {
        await user.update({ loginAttemptCount: 0, user_status: "locked" });
        return res.status(403).json({ message: "Too many failed attempts. Your account is locked." });
      }
      if (user.loginAttemptCount >= 3) {
        return res.status(200).json({ showcaptcha: true, message: "Show Captcha" });
      }
      return res.status(401).json({ message: "Invalid credentials" });
    }
    await user.update({ loginAttemptCount: 0 });
    const otp = Math.floor(100000 + Math.random() * 900000);
    await user.update({ otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    await sendOtpEmail(user.email, otp);
    res.json({ message: "OTP sent. Please verify to complete login.", status: 200 });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// ========================== OTP EMAIL FUNCTION ==========================
const sendOtpEmail = async (userEmail, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
    let mailOptions = {
      from: `"Node SaaS BackEnd" <${EMAIL_USER}>`,
      to: userEmail,
      subject: "Your OTP Code",
      text: `Your OTP for login is: ${otp}`,
      html: `<p>Your OTP for login is: <strong>${otp}</strong></p>`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
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
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.username);
    console.log("Stored OTP:", user.otp, typeof user.otp);
    console.log("Entered OTP:", otp, typeof otp);
    console.log("OTP Expiry:", user.otpExpiresAt);

    // // Validate OTP presence & expiration
    // if (!user.otp || !user.otpExpiresAt) {
    //   return res.status(400).json({ message: "OTP is missing or invalid" });
    // }

    // if (user.otpExpiresAt < new Date()) {
    //   return res.status(400).json({ message: "OTP has expired" });
    // }

    // // Compare OTP
    // const storedOtp = parseInt(user.otp, 10);
    // if (storedOtp !== otp) {
    //   return res.status(400).json({ message: "Invalid OTP" });
    // }

    // Capture login details
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
      ? await Promise.all(userRoles.map(async (ur) => {
          const role = await Role.findByPk(ur.roleId);
          return role ? role.name : null;
        }))
      : [];

    // Generate JWT token with roles
    const token = jwt.sign(
      { id: user.id, username: user.username, roles },
      "your_secret_key",
      { expiresIn: "30d" }
    );

    
    
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
      userRoles.map(async (ur) => {
        const role = await Role.findByPk(ur.roleId);
        return role ? role.name : null;
      })
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: roles.filter((role) => role !== null),
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
};



// ========================== EXPORT FUNCTIONS ==========================
module.exports = { login, verifyOtp, getCurrentUser,CreateAdminLogout };
