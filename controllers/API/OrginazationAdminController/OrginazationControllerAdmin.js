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
const RefreshToken = require("../../../models/refreshToken")(sequelize, DataTypes);
const ContractorInvitation = require("../../../models/contractorinvitations")(sequelize, DataTypes);
// const { sendPasswordResetEmail } = require("../../../utils/sendPasswordResetEmail");
const Organization = require("../../../models/organization")(sequelize, DataTypes);
// const OrganizationSubscribeUser = require("../../../models/organization_subscribeuser")(sequelize, DataTypes);
const emailQueue = require("../../../queues/emailQueue"); // Ensure the emailQueue is correctly imported
const { response } = require("express");

const GetOrginazationDetails = async (req, res) => {
  try {
    console.log("check for routes");
    const user = req.user;
    console.log("user", user);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not logged in." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching contractor details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const OrginazationAdminLogout = async (req, res) => {
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
    const { email } = req.body;
    const user = req.user;
    console.log("user",user)
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = moment().add(72, "hours").toDate();
    const checkEmail = await ContractorInvitation.findOne({
      where: {
        contractor_email: email,
      },
    });
    if (checkEmail) {
      return res.status(400).json({ message: "This email has already been invited." });
    }
    await ContractorInvitation.create({
      contractor_email: email,
      contractor_name: user.name || null,
      invite_token: token,
      invited_by: user.id,
      sent_at: new Date(),
      expires_at: expiresAt,
      status: "pending",
    });
    const inviteUrl = `${process.env.FRONTEND_URL}/contractor/register?token=${token}`;
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
    await emailQueue.add("sendContractorInvite", {
      to: email,
      subject: "You are invited to join as a contractor!",
      html: htmlContent,
      data: {
        name: name || email,
        inviteUrl,
        invitedBy: user.username || user.email,
      },
    });

    // Respond to the client with a success message
    return res.status(200).json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Error sending contractor invitation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const GetInviationLinksList = async (req, res) => {
    try {
      const invitation_list = await ContractorInvitation.findAll();
    
      return res.status(200).json({
        status: 200,
        message: "Invitation list fetched successfully",
        data: invitation_list,
      });
    } catch (error) {
      console.error("Error fetching invitation links:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch invitation list",
        error: error.message,
      });
    }
  };


  const ResendInvitationEmail = async (req, res) => {
    try {
      const { id } = req.body;
  
      // Find the invitation record
      const FindEmail = await ContractorInvitation.findOne({
        where: { id: id }
      });
  
      if (!FindEmail) {
        return res.status(404).json({
          status: 404,
          message: "Invitation not found"
        });
      }
  
      // Generate a new invite token
      const token = crypto.randomBytes(64).toString("hex");
  
      // Set expiration date to 72 hours from now
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 72);
  
      // Update the invitation with new token and expiration date
      await ContractorInvitation.update(
        { invite_token: token, expiration_time: expirationDate },
        { where: { id: id } }
      );
  
      // Find the organization details using invited_by (assuming invited_by is organization ID)
      const findOrganization = await Organization.findOne({
        where: { id: FindEmail.invited_by }
      });
  
      if (!findOrganization) {
        return res.status(404).json({
          status: 404,
          message: "Organization not found"
        });
      }
  
      // Find the user associated with the organization
      const FindInvitedUser = await User.findOne({
        where: { id: findOrganization.user_id }
      });
  
      if (!FindInvitedUser) {
        return res.status(404).json({
          status: 404,
          message: "Inviting user not found"
        });
      }
  
      // Create the invite URL with the new token
      const inviteUrl = `${process.env.FRONTEND_URL}/contractor/register?token=${token}`;
  
      // Construct the HTML email content
      const htmlContent = `
        <html>
          <body>
            <h2>You're Invited, ${FindEmail.contractor_name || FindEmail.contractor_email}!</h2>
            <p><strong>${FindInvitedUser.name || FindInvitedUser.email}</strong> has invited you to join as a contractor on our platform.</p>
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
  
      // Add the email sending job to the queue
      await emailQueue.add("sendContractorInvite", {
        to: FindEmail.contractor_email,
        subject: "You are invited to join as a contractor!",
        html: htmlContent,
        data: {
          name: FindEmail.contractor_name || FindEmail.contractor_email,
          inviteUrl,
          invitedBy: FindInvitedUser.name || FindInvitedUser.email,
        }
      });
  
      console.log("Resent Invitation Email");
  
      // Send success response
      return res.status(200).json({
        status: 200,
        message: "Invitation email resent successfully",
      });
  
    } catch (error) {
      console.error("Error sending invitation email:", error);
      return res.status(500).json({
        status: 500,
        message: "Failed to resend the invitation email",
        error: error.message,
      });
    }
  };
  
module.exports = {
  GetOrginazationDetails,
  OrginazationAdminLogout,
  SendIvitationLinkContractor,
  GetInviationLinksList,
  ResendInvitationEmail
};
