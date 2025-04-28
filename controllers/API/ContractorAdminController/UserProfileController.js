const User = require("../../../models/user");
const jwt = require("jsonwebtoken");
// const UserRole = require("../../../models/userrole");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const Role = require("../../../models/role");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Op } = require("sequelize");
const https = require("https");
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const RefreshToken = require("../../../models/refreshToken");
const ContractorInvitation  = require("../../../models/contractorinvitations");
// const { sendPasswordResetEmail } = require("../../../utils/sendPasswordResetEmail");
// const Organization = require("../../../models/organization")(sequelize, DataTypes);
// const OrganizationSubscribeUser = require("../../../models/organization_subscribeuser")(sequelize, DataTypes);
const emailQueue = require("../../../queues/emailQueue"); // Ensure the emailQueue is correctly imported

const GetContractorDetails = async (req, res) => {
    try {
        console.log("check for routes");
        const user = req.user;
        console.log("user",user)
        if (!user) {
            return res.status(401).json({ message: "Unauthorized. User not logged in." });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching contractor details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const ContractorAdminLogout = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];
  
      console.log("Extracted Token:", token);
  
      if (!token) {
        return res.status(401).json({ error: "Unauthorized: Token missing" });
      }
  
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        if (!decoded?.id) {
          return res.status(401).json({ error: "Unauthorized: Invalid token payload" });
        }
      } catch (err) {
        console.error("JWT Verification Error:", err.message);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
  
      const admin = await User.findByPk(decoded.id);
      if (!admin) {
        return res.status(404).json({ error: "Admin user not found" });
      }
  
      const deleted = await RefreshToken.destroy({
        where: {
          userId: admin.id,
          token: token,
        },
      });
  
      await admin.update({
        logout_at: new Date(),
        login_at: null,
      });
  
      return res.status(200).json({
        message: deleted ? "Contract Admin successfully logged out, refresh token deleted" : "Contract Admin logged out, but no matching refresh token found",
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

  const SendIvitationLinkContractor = async (req, res) => {
    try {
      const { email, name } = req.body;
      const user = req.user;
      
      // Generate a unique token for the invitation
      const token = crypto.randomBytes(64).toString("hex");
      
      // Set the expiration time to 72 hours (3 days)
      const expiresAt = moment().add(72, 'hours').toDate();
      
      // Save the invitation to the database
      await ContractorInvitation.create({
        contractor_email: email,
        contractor_name: name || null,
        invite_token: token,
        invited_by: user.id,
        sent_at: new Date(),
        expires_at: expiresAt,
        status: 'pending'
      });
  
      // Build the invitation URL
      const inviteUrl = `${process.env.FRONTEND_URL}/contractor/register?token=${token}`;
      
      // Define the email body with inline HTML
      const htmlContent = `
        <html>
          <body>
            <h2>You're Invited, ${name || email}!</h2>
            <p><strong>${user.username || user.email}</strong> has invited you to join as a contractor on our platform.</p>
            <p>Click the link below to accept the invitation and complete your registration:</p>
            <p>
              <a href="${inviteUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
            </p>
            <p>This invitation will expire in 72 hours.</p>
            <p>If you did not request this invitation, please ignore this email.</p>
            <p>Thanks,<br>Contractor Platform Team</p>
          </body>
        </html>
      `;
  
      // Add the email sending job to the email queue
      await emailQueue.add('sendContractorInvite', {
        to: email,
        subject: 'You are invited to join as a contractor!',
        html: htmlContent,
        data: {
          name: name || email,
          inviteUrl,
          invitedBy: user.username || user.email
        }
      });
  
      // Respond to the client with a success message
      return res.status(200).json({ message: 'Invitation sent successfully!' });
    } catch (error) {
      console.error('Error sending contractor invitation:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };


module.exports = {
    GetContractorDetails,ContractorAdminLogout,SendIvitationLinkContractor
};
