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
    const { email, isResend = false } = req.body;
    const user = req.user;
    const contractor_name = user.name || email;

    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = moment().add(72, "hours").toDate();

    const organization = await Organization.findOne({
      where: { user_id: user.id },
    });

    if (!organization) {
      return res.status(404).json({ message: "Organization not found." });
    }

    const existing = await ContractorInvitation.findOne({
      where: { contractor_email: email, status: "pending" },
    });

    // Case 1: Existing invite found, and it's not a resend request
    if (existing && !isResend) {
      await ContractorInvitation.update(
        {
          invite_token: token,
          expires_at: expiresAt,
          sent_at: new Date(),
          status:"revoked"
        },
        { where: { id: existing.id } }
      );
      const inviteUrl = `${process.env.FRONTEND_URL}/contractor/register?token=${token}`;
      const htmlContent = generateInviteHTML(user.name || user.email, organization.organization_name, inviteUrl);
      await emailQueue.add("sendContractorInvite", {
        to: email,
        subject: "Reminder: You're invited to join as a contractor!",
        html: htmlContent,
        data: {
          name: contractor_name,
          inviteUrl,
          invitedBy: user.name || user.email,
        },
      });

      return res.status(200).json({ message: "Invitation resent successfully." });
    }

    // Case 2: Either it's a resend OR first time (no record exists)
    if (isResend) {
      await ContractorInvitation.update(
        { status: "revoked" },
        { where: { contractor_email: email, status: "pending" } }
      );
    }

    const inviteUrl = `${process.env.FRONTEND_URL}/contractor/register?token=${token}`;
    const htmlContent = generateInviteHTML(user.name || user.email, organization.organization_name, inviteUrl);

    await ContractorInvitation.create({
      contractor_email: email,
      contractor_name,
      invite_token: token,
      invited_by: user.id,
      sent_at: new Date(),
      expires_at: expiresAt,
      status: "pending",
    });

    await emailQueue.add("sendContractorInvite", {
      to: email,
      subject: "You are invited to join as a contractor!",
      html: htmlContent,
      data: {
        name: contractor_name,
        inviteUrl,
        invitedBy: user.name || user.email,
      },
    });

    return res.status(200).json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Error sending contractor invitation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Extracted email HTML builder
function generateInviteHTML(senderName, organizationName, inviteUrl) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hi there,</p>
        <p><strong>${senderName}</strong> from <strong>${organizationName}</strong> has invited you to fill in a pre-qualification form which, provided it is approved internally by ${organizationName}, will mean that your organisation is prequalified to perform work for ${organizationName}.</p>
        <p>If you are not the person who will register your business and complete the prequalification process, please forward this email including the link to the appropriate person.</p>
        <p>Should you have any questions or concerns about this process, please discuss with your key contact at ${organizationName}.</p>
        <p>
          <a href="${inviteUrl}" style="padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">
            Click here to begin your pre-qualification
          </a>
        </p>
        <p>Best regards,<br>${organizationName} Team</p>
      </body>
    </html>
  `;
}





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

    // 1. Find existing invitation
    const FindEmail = await ContractorInvitation.findOne({
      where: { id },
    });

    if (!FindEmail) {
      return res.status(404).json({
        status: 404,
        message: "Invitation not found",
      });
    }

    // 2. Revoke the previous invitation
    await ContractorInvitation.update(
      { status: "revoked" },
      { where: { id } }
    );

    // 3. Generate new token and expiration
    const token = crypto.randomBytes(64).toString("hex");
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 72);

    // 4. Create a new invitation entry
    const newInvitation = await ContractorInvitation.create({
      contractor_email: FindEmail.contractor_email,
      contractor_name: FindEmail.contractor_name,
      invite_token: token,
      invited_by: FindEmail.invited_by,
      sent_at: new Date(),
      expires_at: expirationDate,
      status: "pending",
    });

    const findOrganization = await Organization.findOne({
      where: { id: FindEmail.invited_by },
    });

    if (!findOrganization) {
      return res.status(404).json({
        status: 404,
        message: "Organization not found",
      });
    }

    const FindInvitedUser = await User.findOne({
      where: { id: findOrganization.user_id },
    });

    if (!FindInvitedUser) {
      return res.status(404).json({
        status: 404,
        message: "Inviting user not found",
      });
    }

    // 6. Build email content
    const inviteUrl = `${process.env.FRONTEND_URL}/contractor/register?token=${token}`;
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hi there,</p>
          <p><strong>${FindInvitedUser.name || FindInvitedUser.email}</strong> from <strong>${findOrganization.organization_name}</strong> has invited you to fill in a pre-qualification form which, provided it is approved internally by ${findOrganization.organization_name}, will mean that your organisation is prequalified to perform work for ${findOrganization.organization_name}.</p>
          <p>If you are not the person who will register your business and complete the prequalification process, please forward this email including the link to the appropriate person.</p>
          <p>Should you have any questions or concerns about this process, in the first instance please discuss with your key contact at ${findOrganization.organization_name}.</p>
          <p>
            <a href="${inviteUrl}" style="padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">
              Click here to begin your pre-qualification
            </a>
          </p>
          <p>Best regards,<br>${findOrganization.organization_name} Team</p>
        </body>
      </html>
    `;

    // 7. Queue email
    await emailQueue.add("sendContractorInvite", {
      to: FindEmail.contractor_email,
      subject: "You are invited to join as a contractor!",
      html: htmlContent,
      data: {
        name: FindEmail.contractor_name || FindEmail.contractor_email,
        inviteUrl,
        invitedBy: FindInvitedUser.name || FindInvitedUser.email,
      },
    });

    console.log("Resent Invitation Email");
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



const handleContractorTokenInvitation  = async(req,res)=>{
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: "Token is required." });
    }
    const invitation = await ContractorInvitation.findOne({
      where: { invite_token: token },
    });
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found." });
    }
    const now = moment();
    const expiryTime = moment(invitation.expires_at);
    if (invitation.status === 'accepted') {
      return res.status(200).json({ message: "Invitation already accepted." });
    }
    if (now.isAfter(expiryTime)) {
      if (invitation.status !== 'expired') {
        await invitation.update({ status: 'expired' });
      }
      return res.status(410).json({ error: "Invitation link has expired." });
    }
    await invitation.update({ status: 'accepted' });
    return res.status(200).json({ message: "Invitation accepted."});
  } catch (error) {
    console.error("Error validating invitation token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  GetOrginazationDetails,
  OrginazationAdminLogout,
  SendIvitationLinkContractor,
  GetInviationLinksList,
  ResendInvitationEmail,
  handleContractorTokenInvitation
};
