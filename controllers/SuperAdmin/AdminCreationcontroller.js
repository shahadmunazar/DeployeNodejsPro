const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../../models/user");
const Role = require("../../models/role");
const UserRole = require("../../models/userrole");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");



const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const CreateUserLogin = async (req, res) => {
  try {
    await Promise.all([
      body("name").notEmpty().withMessage("Name is required").run(req),
      body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format")
        .custom(async (email)=>{
          const existingEmail = await User.findOne({ where: { email } });
          if (existingEmail) {
            throw new Error("Email already registered");
          }
          return true;
        })
        .run(req),
      body("username")
        .optional({ checkFalsy: true })
        .custom(async (username) => {
          if (username) {
            const existingUsername = await User.findOne({ where: { username } });
            if (existingUsername) {
              throw new Error("Username already taken");
            }
          }
          return true;
        })
        .run(req),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .run(req),
      body("roles")
        .custom(async (roles) => {
          // Convert single role ID to an array if needed
          const roleIds = Array.isArray(roles) ? roles : [roles];

          // Ensure at least one role exists
          if (roleIds.length === 0) {
            throw new Error("At least one role is required");
          }

          // Fetch valid roles from DB
          const existingRoles = await Role.findAll({ attributes: ["id"] });
          const validRoleIds = existingRoles.map((role) => role.id);

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
    const userRoles = roleIds.map((roleId) => ({
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
      const users = await User.findAll({
        include: [
          {
            model: Role, // Directly include Role through UserRole
            attributes: ["id", "name"], // Fetch only role ID & name
            through: { attributes: [] }, // Exclude UserRole table fields
          },
        ],
        attributes: ["id", "name", "email", "username","user_status", "createdAt", "updatedAt"],
      });
  
      // Format Data Inline
      const formattedUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        user_status: user.user_status,
        createdAt: user.createdAt
          ? `${String(user.createdAt.getDate()).padStart(2, "0")}-${String(user.createdAt.getMonth() + 1).padStart(2, "0")}-${user.createdAt.getFullYear()} ${String(user.createdAt.getHours()).padStart(2, "0")}:${String(user.createdAt.getMinutes()).padStart(2, "0")}`
          : null,
        updatedAt: user.updatedAt
          ? `${String(user.updatedAt.getDate()).padStart(2, "0")}-${String(user.updatedAt.getMonth() + 1).padStart(2, "0")}-${user.updatedAt.getFullYear()} ${String(user.updatedAt.getHours()).padStart(2, "0")}:${String(user.updatedAt.getMinutes()).padStart(2, "0")}`
          : null,
        roles: user.Roles.map((role) => ({
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
            ? `${String(user.createdAt.getDate()).padStart(2, "0")}-${String(user.createdAt.getMonth() + 1).padStart(2, "0")}-${user.createdAt.getFullYear()} ${String(user.createdAt.getHours()).padStart(2, "0")}:${String(user.createdAt.getMinutes()).padStart(2, "0")}`
            : null,
          updatedAt: user.updatedAt
            ? `${String(user.updatedAt.getDate()).padStart(2, "0")}-${String(user.updatedAt.getMonth() + 1).padStart(2, "0")}-${user.updatedAt.getFullYear()} ${String(user.updatedAt.getHours()).padStart(2, "0")}:${String(user.updatedAt.getMinutes()).padStart(2, "0")}`
            : null,
          roles: user.Roles.map((role) => ({
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
  
      // **Get User ID from params or body**
      const id = req.params.id || req.body.id;
  
      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      const { name, email, username, user_status, role } = req.body; // Expecting a single role ID
  
      // **Find User**
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
  
      // **Fetch Updated User with Role**
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
          ? `${String(updatedUser.createdAt.getDate()).padStart(2, "0")}-${String(updatedUser.createdAt.getMonth() + 1).padStart(2, "0")}-${updatedUser.createdAt.getFullYear()} ${String(updatedUser.createdAt.getHours()).padStart(2, "0")}:${String(updatedUser.createdAt.getMinutes()).padStart(2, "0")}`
          : null,
        updatedAt: updatedUser.updatedAt
          ? `${String(updatedUser.updatedAt.getDate()).padStart(2, "0")}-${String(updatedUser.updatedAt.getMonth() + 1).padStart(2, "0")}-${updatedUser.updatedAt.getFullYear()} ${String(updatedUser.updatedAt.getHours()).padStart(2, "0")}:${String(updatedUser.updatedAt.getMinutes()).padStart(2, "0")}`
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
            order: [["id", "ASC"]] 
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

const   SnedInvitationLink = async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      // **Find User**
      const user = await User.findByPk(id, {
        attributes: ["id", "name", "email", "username", "invite_token", "invite_expires_at"],
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
  
      // **Check if Token is Expired or Doesn't Exist**
      if (!inviteToken || !inviteExpiresAt || inviteExpiresAt < now) {
        inviteToken = crypto.randomBytes(64).toString("hex");
        inviteExpiresAt = new Date();
        inviteExpiresAt.setHours(inviteExpiresAt.getHours() + 48); // 48 hours expiry
  
        // **Update User with New Token & Expiry**
        await user.update({
          invite_token: inviteToken,
          invite_expires_at: inviteExpiresAt,
          invitation_status: "pending",
        });
      }
  
      // **Generate a Temporary Password**
      const tempPassword = Math.random().toString(36).slice(-8); // Example: "xk9Bz7qP"
  
      // **Hash the Password Before Storing**
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      await user.update({ password: hashedPassword });
  
      // **Generate Invitation Link**
      const inviteLink = `http://192.168.68.142:5173/invite/${inviteToken}`;
  
      // **Send Email with Login Credentials**
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Use environment variables
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: "shahadmunazar@gmail.com",
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

//   /avdesh
// shahad


module.exports = { CreateUserLogin,GetAllUsersWithRoles,GetuserById,UpdateUsers,DeleteUser,GetAllRolesListing ,SnedInvitationLink};
