const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const Role = require("../../models/role");
const UserRole = require("../../models/userrole");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");
require("dotenv").config();
const { onlineUsers } = require("../socket");

const nodemailer = require("nodemailer");
const crypto = require("crypto");

const activeTokens = new Set(); // Store active tokens temporarily

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const CreateUserLogin = async (req, res) => {
  try {
    await Promise.all([
      body("name").notEmpty().withMessage("Name is required").run(req),
      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .custom(async email => {
          const existingEmail = await User.findOne({ where: { email } });
          if (existingEmail) {
            throw new Error("Email already registered");
          }
          return true;
        })
        .run(req),
      body("username")
        .optional({ checkFalsy: true })
        .custom(async username => {
          if (username) {
            const existingUsername = await User.findOne({ where: { username } });
            if (existingUsername) {
              throw new Error("Username already taken");
            }
          }
          return true;
        })
        .run(req),
      body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long").run(req),
      body("roles")
        .custom(async roles => {
          // Convert single role ID to an array if needed
          const roleIds = Array.isArray(roles) ? roles : [roles];

          // Ensure at least one role exists
          if (roleIds.length === 0) {
            throw new Error("At least one role is required");
          }

          // Fetch valid roles from DB
          const existingRoles = await Role.findAll({ attributes: ["id"] });
          const validRoleIds = existingRoles.map(role => role.id);

          // Validate each role
          for (let roleId of roleIds) {
            if (!validRoleIds.includes(roleId)) {
              throw new Error(`Invalid role ID: ${roleId}`);
            }
          }
          return true;
        })
        .run(req),
    ]);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    // Extract request data
    const { name, email, username, password, roles } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await User.create({
      name,
      email,
      username,
      password: hashedPassword,
    });

    // Assign roles
    const roleIds = Array.isArray(roles) ? roles : [roles]; // Convert to array if not already
    const userRoles = roleIds.map(roleId => ({
      userId: newUser.id,
      roleId: roleId,
    }));
    await UserRole.bulkCreate(userRoles);
    res.status(200).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const GetAllUsersWithRoles = async (req, res) => {
  try {
    // 🔹 Extract filters from request query
    const { role, status, startDate, endDate } = req.query;

    let whereConditions = {};
    let roleCondition = {};

    // 🔹 Filter by Status (Active/Inactive)
    if (status) {
      whereConditions.user_status = status.toLowerCase() === true ? true : false;
    }

    // 🔹 Filter by Created Date Range
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // 🔹 Filter by Role Name (if provided)
    if (role) {
      roleCondition.name = role;
    }

    // 🔹 Fetch Users with Roles
    const users = await User.findAll({
      where: whereConditions,
      include: [
        {
          model: Role,
          attributes: ["id", "name"],
          through: { attributes: [] },
          where: Object.keys(roleCondition).length ? roleCondition : undefined,
        },
      ],
      attributes: ["id", "name", "email", "username", "user_status", "createdAt", "temp_password_used", "login_at", "logout_at", "updatedAt"],
    });

    // 🔹 Format Data with Online Status
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      user_status: user.user_status,
      temp_password_used: user.temp_password_used,
      login_at: user.login_at,
      logout_at: user.logout_at,
      is_online: onlineUsers.hasOwnProperty(user.id), // 🔥 Check real-time online status
      createdAt: user.createdAt
        ? `${String(user.createdAt.getDate()).padStart(2, "0")}-${String(user.createdAt.getMonth() + 1).padStart(2, "0")}-${user.createdAt.getFullYear()} ${String(
            user.createdAt.getHours()
          ).padStart(2, "0")}:${String(user.createdAt.getMinutes()).padStart(2, "0")}`
        : null,
      updatedAt: user.updatedAt
        ? `${String(user.updatedAt.getDate()).padStart(2, "0")}-${String(user.updatedAt.getMonth() + 1).padStart(2, "0")}-${user.updatedAt.getFullYear()} ${String(
            user.updatedAt.getHours()
          ).padStart(2, "0")}:${String(user.updatedAt.getMinutes()).padStart(2, "0")}`
        : null,
      roles: user.Roles.map(role => ({
        id: role.id,
        name: role.name,
      })),
    }));

    res.status(200).json({ message: "User List Retrieved Successfully", data: formattedUsers });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const GetuserById = async (req, res) => {
  try {
    console.log("Request Params:", req.params); // Debugging
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          attributes: ["id", "name"], // Fetch role ID & name
          through: { attributes: [] }, // Exclude join table fields
        },
      ],
      attributes: ["id", "name", "email", "username", "user_status", "createdAt", "updatedAt"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format Date (DD-MM-YYYY HH:mm)
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      user_status: user.user_status,
      createdAt: user.createdAt
        ? `${String(user.createdAt.getDate()).padStart(2, "0")}-${String(user.createdAt.getMonth() + 1).padStart(2, "0")}-${user.createdAt.getFullYear()} ${String(
            user.createdAt.getHours()
          ).padStart(2, "0")}:${String(user.createdAt.getMinutes()).padStart(2, "0")}`
        : null,
      updatedAt: user.updatedAt
        ? `${String(user.updatedAt.getDate()).padStart(2, "0")}-${String(user.updatedAt.getMonth() + 1).padStart(2, "0")}-${user.updatedAt.getFullYear()} ${String(
            user.updatedAt.getHours()
          ).padStart(2, "0")}:${String(user.updatedAt.getMinutes()).padStart(2, "0")}`
        : null,
      roles: user.Roles.map(role => ({
        id: role.id,
        name: role.name,
      })),
    };

    res.status(200).json({ message: "User Retrieved Successfully", data: formattedUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const UpdateUsers = async (req, res) => {
  try {
    console.log("Request Params:", req.params); // Debugging
    console.log("Request Body:", req.body); // Debugging
    const id = req.params.id || req.body.id;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const { name, email, username, user_status, role } = req.body;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.update({
      name: name || user.name,
      email: email || user.email,
      username: username || user.username,
      user_status: user_status || user.user_status,
    });

    if (role) {
      const roleExists = await Role.findByPk(role);
      if (!roleExists) {
        return res.status(400).json({ message: "Invalid Role ID" });
      }
      await UserRole.update({ roleId: role }, { where: { userId: id } });
      console.log("✅ UserRole Updated Successfully");
    }

    // *Fetch Updated User with Role*
    const updatedUser = await User.findByPk(id, {
      include: [
        {
          model: Role,
          attributes: ["id", "name"],
          through: { attributes: [] }, // Exclude join table fields
        },
      ],
      attributes: ["id", "name", "email", "username", "user_status", "createdAt", "updatedAt"],
    });
    const userRoleEntry = await UserRole.findOne({ where: { userId: id } });
    const updatedRole = userRoleEntry ? await Role.findByPk(userRoleEntry.roleId) : null;
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      user_status: updatedUser.user_status,
      createdAt: updatedUser.createdAt
        ? `${String(updatedUser.createdAt.getDate()).padStart(2, "0")}-${String(updatedUser.createdAt.getMonth() + 1).padStart(
            2,
            "0"
          )}-${updatedUser.createdAt.getFullYear()} ${String(updatedUser.createdAt.getHours()).padStart(2, "0")}:${String(updatedUser.createdAt.getMinutes()).padStart(2, "0")}`
        : null,
      updatedAt: updatedUser.updatedAt
        ? `${String(updatedUser.updatedAt.getDate()).padStart(2, "0")}-${String(updatedUser.updatedAt.getMonth() + 1).padStart(
            2,
            "0"
          )}-${updatedUser.updatedAt.getFullYear()} ${String(updatedUser.updatedAt.getHours()).padStart(2, "0")}:${String(updatedUser.updatedAt.getMinutes()).padStart(2, "0")}`
        : null,
      role: updatedRole ? { id: updatedRole.id, name: updatedRole.name } : null,
    };
    res.status(200).json({ message: "User Updated Successfully", data: formattedUser });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    await UserRole.destroy({ where: { userId: id } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const GetAllRolesListing = async (req, res) => {
  try {
    console.log("Fetching all roles...");
    const roles = await Role.findAll({
      attributes: ["id", "name"],
      order: [["id", "ASC"]],
    });
    if (!roles.length) {
      return res.status(404).json({ message: "No roles found" });
    }
    res.status(200).json({ message: "Roles retrieved successfully", data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const SnedInvitationLink = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // *Find User*
    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "username", "password", "invite_token", "invitation_status", "invite_expires_at"],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.email) {
      return res.status(400).json({ message: "User does not have an email" });
    }
    let inviteToken = user.invite_token;
    let inviteExpiresAt = user.invite_expires_at ? new Date(user.invite_expires_at) : null;
    const now = new Date();
    if (!inviteToken || !inviteExpiresAt || inviteExpiresAt < now) {
      inviteToken = crypto.randomBytes(64).toString("hex");
      inviteExpiresAt = new Date();
      inviteExpiresAt.setHours(inviteExpiresAt.getHours() + 48); // 48 hours expiry

      // *Update User with New Token & Expiry*
      await user.update({
        invite_token: inviteToken,
        invite_expires_at: inviteExpiresAt,
        invitation_status: "sent",
      });
    }

    // *Generate a Temporary Password*
    const tempPassword = Math.random().toString(36).slice(-8); // Example: "xk9Bz7qP"

    // *Hash the Password Before Storing*
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    await user.update({ password: hashedPassword });

    // *Generate Invitation Link*
    const inviteLink = `http://192.168.68.142:5173/invite/${inviteToken}`;

    // *Send Email with Login Credentials*
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Use environment variables
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "mailto:shahadmunazar@gmail.com",
      to: user.email,
      subject: "You're Invited! Your Login Details",
      html: `
          <p>Hello ${user.name},</p>
          <p>You have been invited to join our platform. Here are your login details:</p>
          <ul>
            <li><strong>Username:</strong> ${user.username}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
          </ul>
          <p>We recommend changing your password after logging in.</p>
          <p>To accept the invitation, click here: <a href="${inviteLink}">${inviteLink}</a></p>
          <p>This invitation will expire in 48 hours.</p>
          <p>Thank you!</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Invitation email sent with login details" });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const checkTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized, token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    activeTokens.add(token); // Track active tokens
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const UpdateUsersStatus = async (req, res) => {
  try {
    const { id, user_status } = req.body;
    if (!id || !user_status) {
      return res.status(400).json({ message: "User ID and status are required" });
    }
    console.log('req body',req.body)
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (![true, false].includes(user_status)) {
      return res.status(400).json({ message: "Invalid status. Use 'True' or 'False'." });
    }
    await user.update({ user_status });
    return res.status(200).json({
      message: `User status updated to ${user_status}`,
      data: { id: user.id, name: user.name, user_status: user.user_status },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const GetAllUsersToken = async (req, res) => {
  try {
    // Fetch all users with their tokens
    const users = await User.findAll({
      attributes: ["id", "name", "email", "token"],
    });

    // Process user tokens
    const userTokens = users.map(user => {
      let isTokenValid = false;
      let decodedToken = null;
      let tokenExpiry = null;

      if (user.token) {
        try {
          decodedToken = jwt.verify(user.token, process.env.JWT_SECRET);
          isTokenValid = decodedToken.exp > Math.floor(Date.now() / 1000);
          tokenExpiry = new Date(decodedToken.exp * 1000);
        } catch (err) {
          isTokenValid = false;
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        token: user.token,
        token_valid: isTokenValid,
        token_expiry: tokenExpiry,
      };
    });

    res.status(200).json({ message: "Fetched all users' tokens", data: userTokens });
  } catch (error) {
    console.error("Error fetching users' tokens:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const exportAllUsers = async (req, res) => {
  try {
    const { status, role } = req.query;

    // Build where clause
    const userWhereClause = {};
    if (status) userWhereClause.user_status = status === "true"; // 'true' or 'false'

    const users = await User.findAll({
      where: userWhereClause,
      attributes: ["name", "email", "user_status", "login_at", "createdAt"],
      include: [
        {
          model: Role,
          attributes: ["name"],
          through: { attributes: [] },
          where: role ? { name: role } : undefined,
        },
      ],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found to export." });
    }

    const formattedUsers = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Role: user.Roles.map(r => r.name).join(", "),
      Status: user.user_status ? "active" : "inactive",
      "Last Login": user.login_at ? user.login_at.toISOString() : "",
      "Created Date": user.createdAt.toISOString(),
    }));

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.columns = Object.keys(formattedUsers[0]).map(key => ({
      header: key,
      key,
      width: 25,
    }));

    worksheet.addRows(formattedUsers);

    // Set response headers for Excel
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    // Write Excel to response stream
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  exportAllUsers,
  GetAllUsersToken,
  CreateUserLogin,
  GetAllUsersWithRoles,
  GetuserById,
  UpdateUsers,
  DeleteUser,
  GetAllRolesListing,
  SnedInvitationLink,
  UpdateUsersStatus,
};
