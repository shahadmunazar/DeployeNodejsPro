const User = require("../../../models/user");
const jwt = require("jsonwebtoken");
// const UserRole = require("../../../models/userrole");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const Role = require("../../../models/role");
const momentTimeZone = require("moment-timezone"); // Import moment-timezone
const { v4: uuidv4 } = require("uuid");

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Op } = require("sequelize");
const https = require("https");
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const RefreshToken = require("../../../models/refreshToken")(sequelize, DataTypes);
const ContractorInvitation = require("../../../models/contractorinvitations")(sequelize, DataTypes);
const ContractorRegistration = require("../../../models/ContractorRegistration")(sequelize, DataTypes);
// const { sendPasswordResetEmail } = require("../../../utils/sendPasswordResetEmail");
const Organization = require("../../../models/organization")(sequelize, DataTypes);
// const OrganizationSubscribeUser = require("../../../models/organization_subscribeuser")(sequelize, DataTypes);
const emailQueue = require("../../../queues/emailQueue"); // Ensure the emailQueue is correctly imported
const { response } = require("express");
const organization = require("../../../models/organization");
const { stat } = require("fs");
const ContractorOrganizationSafetyManagement = require("../../../models/contractororganizationsafetymanagement")(sequelize, DataTypes);
const ContractorPublicLiability = require("../../../models/contractorpublicliability")(sequelize, DataTypes);
const ContractorRegisterInsurance = require("../../../models/contractorregisterinsurance")(sequelize, DataTypes);
const ContractorCompanyDocument = require("../../../models/contractor_company_document")(sequelize, DataTypes);
const AuditLogsContractorAdmin = require("../../../models/AuditLogsContractorAdmin")(sequelize, DataTypes);


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
      where: { contractor_email: email },
    });
    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "This email has already accepted the invitation." });
      }
      if (!isResend) {
        return res.status(400).json({ message: "This email has already been invited." });
      }
      await ContractorInvitation.update(
        {
          invite_token: token,
          expires_at: expiresAt,
          sent_at: new Date(),
          status: "revoked",
        },
        { where: { id: existing.id } }
      );
      const inviteUrl = `${process.env.FRONTEND_URL}/contractor/register/token=${token}`;
      const htmlContent = generateInviteHTML(user.name || user.email, organization.organization_name, inviteUrl);
      await emailQueue.add("sendContractorInvite", {
        to: email,
        subject: "You're invited to join as a contractor!",
        html: htmlContent,
        data: {
          name: contractor_name,
          inviteUrl,
          invitedBy: user.name || user.email,
        },
      });

      return res.status(200).json({ message: "Invitation resent successfully." });
    }
    const inviteUrl = `${process.env.FRONTEND_URL}/contractor/register/token=${token}`;
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

// Helper to generate consistent HTML email content
function generateInviteHTML(senderName, organizationName, inviteUrl) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hi there,</p>
        <p><strong>${senderName}</strong> from <strong>${organizationName}</strong> has invited you to fill in a pre-qualification form which, provided it is approved internally by ${organizationName}, will mean that your organisation is prequalified to perform work for ${organizationName}.</p>
        <p>If you are not the person who will register your business and complete the prequalification process, please forward this email including the link to the appropriate person.</p>
        <p>Should you have any questions or concerns about this process, please discuss with your key contact at ${organizationName}.</p>
        <p>
          <a href="${inviteUrl}" target="_blank" style="padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">
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
    const user = req.user;
    const user_id = user.id;
    console.log("user", user_id);

    // 1. Get all invitations by this user
    const invitation_list = await ContractorInvitation.findAll({
      where: {
        invited_by: user_id,
      },
    });

    // 2. Attach registration info to each invitation (if exists)
    const enrichedInvitations = await Promise.all(
      invitation_list.map(async invitation => {
        const registration = await ContractorRegistration.findOne({
          where: {
            contractor_invitation_id: invitation.id,
            submission_status: "confirm_submit",
          },
          attributes: ["submission_status", "contractor_company_name", "company_representative_first_name", "company_representative_last_name", "state"],
        });

        return {
          ...invitation.toJSON(),
          registration: registration ? registration.toJSON() : null,
        };
      })
    );

    return res.status(200).json({
      status: 200,
      message: "Invitation list fetched successfully",
      data: enrichedInvitations,
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
    await ContractorInvitation.update({ status: "revoked" }, { where: { id } });

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
          <p><strong>${FindInvitedUser.name || FindInvitedUser.email}</strong> from <strong>${
      findOrganization.organization_name
    }</strong> has invited you to fill in a pre-qualification form which, provided it is approved internally by ${
      findOrganization.organization_name
    }, will mean that your organisation is prequalified to perform work for ${findOrganization.organization_name}.</p>
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

const handleContractorTokenInvitation = async (req, res) => {
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
    if (invitation.status === "accepted") {
      return res.status(200).json({ message: "Invitation already accepted." });
    }
    if (now.isAfter(expiryTime)) {
      if (invitation.status !== "expired") {
        await invitation.update({ status: "expired" });
      }
      return res.status(410).json({ error: "Invitation link has expired." });
    }
    await invitation.update({ status: "accepted" });
    return res.status(200).json({ message: "Invitation accepted." });
  } catch (error) {
    console.error("Error validating invitation token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const SendverificationCode = async (req, res) => {
  try {
    const { email, new_form } = req.body;

    const otp = Math.floor(10000000 + Math.random() * 90000000).toString(); // 8-digit OTP
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

    let existingInvitation = await ContractorInvitation.findOne({ where: { contractor_email: email } });
    let invitation;

    // 1. Case: Email not found OR new_form is true => create new record
    if (!existingInvitation || new_form === true) {
      invitation = await ContractorInvitation.create({
        contractor_email: email,
        OneTimePass: otp,
        invited_by: existingInvitation?.invited_by || null,
        otpExpiresAt,
      });
    } else {
      // 2. Case: Existing record found, just update OTP
      invitation = existingInvitation;
      await invitation.update({
        OneTimePass: otp,
        otpExpiresAt,
      });
    }

    const organizationName = invitation.contractor_name || "James Milson Villages";

    console.log("organizationName", organizationName);

    // Add job to email queue
    await emailQueue.add("sendOtpEmail", {
      to: email,
      subject: "Your OTP Code",
      text: `Hi there,
Your passcode is: ${otp}
Copy and paste this into the passcode field on your web browser.
Please note that this code is only valid for 30 minutes. You can generate another passcode, if required.
Thank you,
${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://your-logo-url.com/logo.png" alt="James Milson Village" width="200" />
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 18px;">Hi there,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Your passcode is: <span style="font-size: 24px; font-weight: bold; color: #007bff;">${otp}</span>
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Copy and paste this into the passcode field on your web browser.
            </p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Please note that this code is only valid for <strong>30 minutes</strong>. You can generate another passcode, if required.
            </p>
            <br />
            <p style="font-size: 16px; color: #888;">
              Thank you,<br>
              <strong>${organizationName}</strong>
            </p>
            <hr style="border-top: 1px solid #ddd; margin-top: 30px;" />
            <p style="font-size: 12px; color: #bbb; text-align: center;">
              If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ status: 200, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

const VerifyMultifactorAuth = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const invitation = await ContractorInvitation.findOne({
      where: { contractor_email: email },
      order: [["id", "DESC"]],
    });
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found for this email" });
    }

    const currentTime = new Date();
    if (invitation.otpExpiresAt < currentTime) {
      return res.status(400).json({ error: "OTP has expired. Please request a new OTP." });
    }

    if (invitation.OneTimePass !== otp) {
      return res.status(400).json({ error: "Invalid OTP. Please try again." });
    }

    const findUser = await User.findOne({
      where: { id: invitation.invited_by },
    });
    if (!findUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const findOrganization = await Organization.findOne({
      where: { user_id: findUser.id },
    });
    if (!findOrganization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    await invitation.update({ OneTimePass: null, otpExpiresAt: null });

    const contractorRegistration = {
      invited_organization_by: findOrganization.id,
      contractor_invitation_id: invitation.id,
    };

    const frontendUrl = process.env.FRONTEND_URL;
    const tokenFind = invitation.invite_token;

    const fullUrl = `${frontendUrl}/contractor/prequalification/${tokenFind}`;

    return res.status(200).json({
      message: "OTP verified successfully",
      status: 200,
      registration: contractorRegistration,
      contractor_url: fullUrl,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
};

const GetDetailsInvitationDetails = async (req, res) => {
  try {
    const { req_id } = req.query;

    const contractor = await ContractorRegistration.findOne({ where: { id: req_id } });

    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found" });
    }

    const organization = await Organization.findOne({
      where: { id: contractor.invited_organization_by },
    });

    const user = await User.findOne({
      where: { id: organization?.user_id },
    });

    const invitation = await ContractorInvitation.findOne({
      where: { id: contractor.contractor_invitation_id },
    });

    // Remove these three blocks:
    // const insurance = await ContractorRegisterInsurance.findOne({ ... });
    // const publicLiability = await ContractorPublicLiability.findOne({ ... });
    // const safetyManagement = await ContractorOrganizationSafetyManagement.findOne({ ... });

    // Get all documents from ContractorCompanyDocument
    const allDocuments = await ContractorCompanyDocument.findAll({
      where: { contractor_id: contractor.id }
    });

    const backendUrl = process.env.BACKEND_URL || "";

    let staffMemberDetails = {};
    try {
      staffMemberDetails = JSON.parse(contractor.provide_name_position_mobile_no || "{}");
    } catch (e) {
      console.warn("Invalid staff member JSON");
    }

    let comments = contractor.comments_history;
    if (typeof comments === "string") {
      try {
        comments = JSON.parse(comments);
      } catch (err) {
        console.warn("Invalid comments JSON");
        comments = [];
      }
    }

    const createdAt = new Date(contractor.createdAt);
    const expiresDate = new Date(createdAt);
    expiresDate.setFullYear(createdAt.getFullYear() + 1);
    const formattedExpires = expiresDate.toLocaleDateString("en-GB"); // Format: dd/mm/yyyy
    const renewalStatus = new Date() <= expiresDate ? "On" : "Off";
    const allData = {
      id: contractor.id,
      company_name: contractor.contractor_company_name,
      invitedBy: organization?.organization_name || null,
      Name: user?.name || null,
      Email_Address: invitation?.contractor_email || null,
      Phone_No: contractor.contractor_phone_number,
      Status: contractor.submission_status,
      Expires: formattedExpires,
      Renewal: renewalStatus,
      // Remove insurance/publicLiability/safetyManagement fields
      // Add all company documents
      company_documents: allDocuments,

      contractor_abn: contractor.abn_number,
      contractor_company_name: contractor.name,
      contractor_trading_name: contractor.contractor_trading_name,
      company_structure: contractor.company_structure,
      contractor_invitation_id: contractor.contractor_invitation_id,
      company_representative_first_name: contractor.company_representative_first_name,
      company_representative_last_name: contractor.company_representative_last_name,
      position_at_company: contractor.position_at_company,
      address: contractor.address,
      street: contractor.street,
      suburb: contractor.suburb,
      state: contractor.state,
      postal_code: contractor.postal_code,
      contractor_phone_number: contractor.contractor_phone_number,
      service_to_be_provided: contractor.service_to_be_provided,
      covered_amount: contractor.covered_amount,
      have_professional_indemnity_insurance: contractor.have_professional_indemnity_insurance,
      is_staff_member_nominated: contractor.is_staff_member_nominated,
      provide_name_position_mobile_no: staffMemberDetails,
      are_employees_provided_with_health_safety: contractor.are_employees_provided_with_health_safety,
      are_employees_appropriately_licensed_qualified_safety: contractor.are_employees_appropriately_licensed_qualified_safety,
      are_employees_confirmed_as_competent_to_undertake_work: contractor.are_employees_confirmed_as_competent_to_undertake_work,
      do_you_all_sub_contractor_qualified_to_work: contractor.do_you_all_sub_contractor_qualified_to_work,
      do_you_all_sub_contractor_required_insurance_public_liability: contractor.do_you_all_sub_contractor_required_insurance_public_liability,
      have_you_identified_all_health_safety_legislation: contractor.have_you_identified_all_health_safety_legislation,
      do_you_have_emergency_response: contractor.do_you_have_emergency_response,
      do_you_have_procedures_to_notify_the_applicable: contractor.do_you_have_procedures_to_notify_the_applicable,
      do_you_have_SWMS_JSAS_or_safe_work: contractor.do_you_have_SWMS_JSAS_or_safe_work,
      do_your_workers_conduct_on_site_review: contractor.do_your_workers_conduct_on_site_review,
      do_you_regularly_monitor_compliance: contractor.do_you_regularly_monitor_compliance,
      do_you_have_procedures_circumstances: contractor.do_you_have_procedures_circumstances,
      have_you_been_prosecuted_health_regulator: contractor.have_you_been_prosecuted_health_regulator,
      submission_status: contractor.submission_status,
      comments,
    };
    Object.keys(allData).forEach(key => {
      if (allData[key] === undefined) {
        allData[key] = null;
      }
    });
    return res.status(200).json({ status: 200, data: allData });
  } catch (error) {
    console.error("Error fetching contractor details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const UpdateContractorComments = async (req, res) => {
  try {
    const { req_id, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;
    const contractor = await ContractorRegistration.findOne({
      where: { id: req_id },
    });
    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found" });
    }
    let existingComments = [];
    if (Array.isArray(contractor.comments_history)) {
      existingComments = contractor.comments_history;
    } else if (typeof contractor.comments_history === "string") {
      try {
        const parsed = JSON.parse(contractor.comments_history);
        existingComments = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        existingComments = [];
      }
    } else {
      existingComments = [];
    }
    const dateAdded = moment().tz("Australia/Sydney").format("DD-MM-YYYY HH:mm");
    const newComment = {
      id: Number(`${Date.now()}${Math.floor(100 + Math.random() * 900)}`),
      user_id: userId,
      comment: comment,
      date_added: dateAdded,
      CommentsBy: userName,
    };
    existingComments.push(newComment);
    await contractor.update({
      comments_history: existingComments,
    });
    return res.status(200).json({
      message: "Comment added Successfully",
      comments_history: existingComments,
    });
  } catch (error) {
    console.error("Error updating contractor comments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const UpdateSubmissionStatus = async (req, res) => {
  try {
    const { req_id, submission_status, comments, approval_type, inclusion_list, minimum_hours, bcc_email } = req.body;

    const userId = req.user?.id || null;
    const userName = req.user?.name || "Admin";

    if (!req_id || !submission_status) {
      return res.status(400).json({ message: "req_id and submission_status are required." });
    }

    const contractor = await ContractorRegistration.findOne({ where: { id: req_id } });

    if (!contractor) {
      return res.status(404).json({ message: "Contractor registration not found." });
    }

    // Prepare comments history
    let updatedComments = [];
    if (contractor.comments_history) {
      try {
        const parsed = JSON.parse(contractor.comments_history);
        updatedComments = Array.isArray(parsed) ? parsed : [];
      } catch {
        console.warn("Invalid comments_history format. Resetting to empty array.");
      }
    }

    const dateAdded = moment().tz("Australia/Sydney").format("DD-MM-YYYY HH:mm");

    if (comments) {
      updatedComments.push({
        id: Number(`${Date.now()}${Math.floor(100 + Math.random() * 900)}`),
        user_id: userId,
        comment: comments,
        date_added: dateAdded,
        CommentsBy: userName,
      });
    }

    // Update contractor submission_status and comments_history
    await contractor.update({
      submission_status,
      comments_history: updatedComments,
    });

    // Safely fetch invitation with ID for update
    const invitation = await ContractorInvitation.findOne({
      where: { id: contractor.contractor_invitation_id },
      attributes: [
        "id", // Include primary key!
        "contractor_email",
        "invited_by",
        "approval_type",
        "inclusion_list",
        "minimum_hours",
        "bcc_email",
      ],
    });

    if (invitation) {
      const startDate = moment().tz("Australia/Sydney");
      const endDate = startDate.clone().add(Number(minimum_hours), "hours");

      // Use Model.update to avoid issues with missing primary key
      await ContractorInvitation.update(
        {
          approval_type,
          inclusion_list,
          minimum_hours: endDate,
          bcc_email,
        },
        {
          where: { id: invitation.id },
        }
      );
    } else {
      console.warn("No matching invitation found for contractor.");
    }

    // Get organization name
    let organizationName = "James Milson Villages";

    if (invitation?.invited_by) {
      const inviter = await User.findOne({ where: { id: invitation.invited_by } });
      if (inviter) {
        const org = await Organization.findOne({
          where: { user_id: inviter.id },
          attributes: ["organization_name"],
        });
        if (org) {
          organizationName = org.organization_name;
        }
      }
    }

    if (["approved", "rejected"].includes(submission_status.toLowerCase()) && invitation?.contractor_email) {
      await emailQueue.add("sendSubmissionStatusEmail", {
        to: invitation.contractor_email,
        bcc: bcc_email || undefined,
        subject: `Contractor Submission ${submission_status.toUpperCase()} - ${organizationName}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 30px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://your-logo-url.com/logo.png" alt="${organizationName}" style="max-width: 200px;" />
              </div>
              <h2 style="color: #007bff;">Contractor Submission Status: ${submission_status.charAt(0).toUpperCase() + submission_status.slice(1)}</h2>
              <p>Dear Contractor,</p>
              <p>Your contractor registration submission has been <strong style="color: ${
                submission_status === "approved" ? "#28a745" : "#dc3545"
              }">${submission_status.toUpperCase()}</strong>.</p>
              ${
                comments
                  ? `
                <p><strong>Reviewer Comments:</strong></p>
                <blockquote style="border-left: 4px solid #ccc; margin: 10px 0; padding-left: 15px; color: #555;">
                  ${comments}
                </blockquote>`
                  : ""
              }
              <p><strong>Reviewed by:</strong> ${userName}</p>
              <p><strong>Date:</strong> ${dateAdded}</p>
              <hr style="margin: 30px 0;">
              <p>If you have any questions, please reply to this email or contact our office.</p>
              <p>Thank you for working with <strong>${organizationName}</strong>.</p>
              <br>
              <p style="color: #888;">Kind regards,<br>The ${organizationName} Team</p>
            </div>
          </div>
        `,
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Submission status and comments updated successfully.",
      updated_status: submission_status,
      comments_history: updatedComments,
    });
  } catch (error) {
    console.error("Error updating submission status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const GetSubmissionPrequalification = async (req, res) => {
  try {
    const { filter } = req.query;

    const reqUserId = req.user?.id;
    const Organizations = await Organization.findOne({
      where: { user_id: reqUserId },
      attributes: ["id", "organization_name", "user_id"],
    }); 

    let whereClause = {};

    if (filter !== undefined && filter !== "") {
      if (filter === "true" || filter === "false") {
        whereClause.status = filter === "true";
      } else {
        whereClause.submission_status = filter;
      }
    }
    whereClause.invited_organization_by = Organizations.id;
    // If filter is null, empty or undefined => whereClause = {} => fetch all records

    const data = await ContractorRegistration.findAll({
      where: whereClause,
      attributes: {
        include: [
          [
            sequelize.literal(`(
          SELECT contractor_email 
          FROM contractor_invitations 
          WHERE contractor_invitations.id = ContractorRegistration.contractor_invitation_id 
          AND contractor_invitations.invited_by = ${reqUserId}
        )`),
        "contractor_email",
          ],
        ],
      },
    });

    res.status(200).json({
      status: 200,
      data,
      message: "Submission Prequalification data retrieved successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: 500,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const UpdateInvitationStatus = async (req, res) => {
  try {
    const { invitation_token } = req.body;

    const updateResult = await ContractorInvitation.update(
      { status: 'Accepted' },
      { where: { invitation_token } }
    );
    if (updateResult[0] === 0) {
      return res.status(404).json({ message: 'Invitation not found or already accepted.' });
    }
    res.status(200).json({ message: 'Invitation status updated to Accepted.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const CompanyComplianceList = async (req, res) => {
  try {
    const { status,compliance_status } = req.query;
    const reqUserId = req.user?.id;

    const Organizations = await Organization.findOne({
      where: { user_id: reqUserId },
      attributes: ["id", "organization_name", "user_id"],
    }); 

      let whereClause = {};
    
    if (compliance_status !== undefined && compliance_status !== "") {
        whereClause.compliance_status = compliance_status;
    }
    if( status !== undefined && status !== "") {
      if (status === "true" || status === "false") {
        whereClause.status = status === "true";
      } else {
        whereClause.status = status;  
      }
    }      

    whereClause.invited_organization_by = Organizations.id;
    // If filter is null, empty or undefined => whereClause = {} => fetch all records

    const data = await ContractorRegistration.findAll({
      where: whereClause,
      attributes: {
        include: [
          [
                  sequelize.literal(`(
                SELECT contractor_email 
                FROM contractor_invitations 
                WHERE contractor_invitations.id = ContractorRegistration.contractor_invitation_id 
                AND contractor_invitations.invited_by = ${reqUserId}
              )`),
              "contractor_email",
          ],
        ],
      },
    });

    res.status(200).json({
      status: 200,
      data,
      message: "Company compliance list retrieved successfully",
    }); 


  } catch (error) {
    console.error("Error fetching company compliance list:", error);
    res.status(500).json({  message: "Internal server error" });    
  }
}

const getComplianceDetails = async (req, res) => {
  try {
    const { contractor_reg_id } = req.query;     
      const reqUserId = req.user?.id;

    if (!contractor_reg_id) {
      return res.status(400).json({ message: "Contractor registration ID is required." });
      
    }

    const Organizations = await Organization.findOne({
      where: { user_id: reqUserId },
      attributes: ["id", "organization_name", "user_id"],
    }); 

     const complianceDetails = await ContractorRegistration.findOne({
      where: { id: contractor_reg_id, invited_organization_by: Organizations.id },
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT contractor_email 
              FROM contractor_invitations 
              WHERE contractor_invitations.id = ContractorRegistration.contractor_invitation_id 
              AND contractor_invitations.invited_by = ${reqUserId}
            )`),
            "contractor_email",
          ],
        ],
      },
    });

    if (!complianceDetails) { 
      return res.status(404).json({ message: "Compliance details not found for the given contractor registration ID." });
    }

    // Fetch all company documents for this contractor
    const complianceItems = await ContractorCompanyDocument.findAll({
      where: { contractor_id: contractor_reg_id }
    });

    // Attach documents to the result
    const result = {
      ...complianceDetails.toJSON(),
      compliance_items: complianceItems
    };

    res.status(200).json({
      status: 200,
      data: result,
      message: "Compliance details fetched successfully"
    });
      
  } catch (error) {
    console.error("Error fetching compliance details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const resendEmailForDocsExpired = async (req, res) => {
  try {

    console.log("rrr",req.body)
    const { contractor_reg_id, compliance_id } = req.body;
    const senderID = req.user?.id;

    if (!contractor_reg_id || !compliance_id) {
      return res.status(400).json({
        status: 400,
        message: "contractor_reg_id and compliance_id are required.",
      });
    }

      const complianceItems = await ContractorCompanyDocument.findOne({
      where: { id: compliance_id }
    });

    if (!complianceItems || complianceItems.length === 0) {
      return res.status(404).json({ message: "No compliance items found for this contractor." });
    }


const complianceDetail = await ContractorRegistration.findOne({
              where: { id: complianceItems.contractor_id },
              attributes: [
                "id",
                "abn_number",
                "contractor_company_name",
                "contractor_trading_name",
                "company_representative_first_name",
                "contractor_invitation_id",
                [sequelize.literal(`(
                  SELECT contractor_email 
                  FROM contractor_invitations 
                  WHERE contractor_invitations.id = ContractorRegistration.contractor_invitation_id 
                )`), "contractor_email"],
              ],
            });

    if (!complianceDetail) { 
      return res.status(404).json({ message: "Compliance details not found for the given contractor registration ID." });
    }
    
    console.log("complianceDetails", complianceDetail.toJSON());

    const getComplianceDetails =  complianceDetail.toJSON();
    console.log("getComplianceDetailsss", getComplianceDetails.contractor_email);
    if(complianceItems.end_date < new Date()) {
      console.log("Compliance item has expired, sending email...");
    }

         const auditLog = await AuditLogsContractorAdmin.create({
                          contractor_id: complianceItems.contractor_id,
                          entity_type  : complianceItems.document_type, // e.g., 'safety_management', 'public_liability', etc.
                          entity_id    : complianceItems.id,
                          reviewer_id  : req.user?.id,
                          reviewer_name: req.user?.name,
                          action       : 'sent',
                          comments     : 'Resend email for expired document',
                          // contractor_type: 'contractor', // for worker documents
                    });
                    // console.log('Audit Log created:', auditLog.toJSON());

        await ReSendEmailDocsExpried(getComplianceDetails, auditLog, 'registration');

        return res.status(200).json({"message":"Email sent for expired document."});
    

  } catch (error) {
    console.error("Error in resendEmailForDocsExpired:", error);
    return res.status(500).json({
      status: 500,
      message:  error.message || "Internal server error.",
    });
  }
};    

const ReSendEmailDocsExpried = async (complianceDetails, auditLog, register_type) => {
  try {   
          let emailID, name;
          if(register_type === 'registration'){ // for contarctor registration
              const { contractor_email, company_representative_first_name} = complianceDetails;
               emailID = contractor_email;
               name = company_representative_first_name? company_representative_first_name: "Contractor Admin";
          }else{
              const { email, first_name,last_name } = complianceDetails;
               emailID = email;
               name = first_name ? `${first_name} ${last_name}` : "Contractor";
          }

    
    const { entity_type, action, comments, end_date } = auditLog;
    const status = action; // Assuming action is the status
  
    if (!emailID) {
      throw new Error("No email found for this contractor.");
    }

    const link = `${process.env.FRONTEND_URL}/user/login`;
    await emailQueue.add("ReSendEmailDocsExpried", {
      to: emailID,
      subject: "Action Required: Contractor Document Expired",
      html: `
        <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; }
                .button { background-color: #004b8d; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; }
                .status-approved { color: #28a745; font-weight: bold; }
                .status-rejected { color: #dc3545; font-weight: bold; }
                .document-list { margin: 20px 0; padding-left: 20px; }
                .reason { background-color: #f8f9fa; padding: 10px; border-left: 4px solid #004b8d; margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Contractor Document Status Notification</h2>
                <p>Dear ${name || "Contractor Admin"},</p>
          
                 <p>The following document for your contractor registration has expired and requires resubmission:</p>
            
                <ul class="document-list">
                  ${entity_type === 'safety_management' ? '<li><strong>File Name:</strong> Safety Management Plan</li>' : ''}
                  ${entity_type === 'public_liability' ? '<li><strong>File Name:</strong> Public Liability</li>' : ''}
                  ${entity_type === 'register_insurance' ? '<li><strong>File Name:</strong> Register Insurance</li>' : ''}
                 <li><strong>Expiry Date:</strong> ${end_date ? new Date(end_date).toLocaleDateString() : "N/A"}</li>
                  </ul> 
                  <h4>Status: <span class="status-expired">${status}</span></h4>
              
               <div class="reason">
                <p>${comments || 'Please upload a new, valid document as soon as possible.'}</p>
                </div>
                
                <p>Please click the button below to view details or take further action:</p>
                <p><a href="${link}" class="button">View Details</a></p>
                <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
                <p><a href="${link}">${link}</a></p>
                
                <p>If you have any questions, please contact our support team.</p>
                <p>Regards,<br/>Konnect</p>
              </div>
            </body>
            </html>
      `,
    });

     return;

  } catch (error) {
    console.error("Error in ReSendEmailDocsExpried:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
};

const ActivateContratorAdmin = async (req, res) => {
  try {
    const { contractor_reg_id } = req.body;
    if (!contractor_reg_id) {
      return res.status(400).json({ message: "contractor_reg_id is required." });
    }

    // 1. Get contractor registration and invitation
    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_reg_id },
    });
    if (!contractor) {
      return res.status(404).json({ message: "Contractor not found." });
    }

    const invitation = await ContractorInvitation.findOne({
      where: { id: contractor.contractor_invitation_id },
    });
    // Check if invitation exists
    if (!invitation) {
      return res.status(404).json({ message: "Contractor invitation not found." });
    }

    // 2. Check all compliance items are approved
    const complianceItems = await ContractorCompanyDocument.findAll({
      where: { contractor_id: contractor_reg_id },
    });
    if (!complianceItems.length || complianceItems.some(item => item.approved_status !== 'approved')) {
      return res.status(400).json({ message: "All compliance items must be approved before activation." });
    }

   // 3. Check if user already exists
    let user = await User.findOne({ where: { email: invitation.contractor_email } });
    let plainPassword;
    if (!user) {
      // 4. Generate a strong random 8-character password
      plainPassword = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);

      // 5. Create user
      let userName = contractor.company_representative_first_name + ' ' + contractor.company_representative_last_name || invitation.contractor_email;
      user = await User.create({
        name: userName,
        email: invitation.contractor_email,
        password: bcrypt.hashSync(plainPassword, 10), // hashed password
        user_status: 1, // active
      });

      // 6. Assign contractor admin role (roleId 3 assumed)
      await sequelize.models.UserRoles.create({
        userId: user.id,
        roleId: 3,
      });
    }

    // 7. Send activation email with password
    const link = `${process.env.FRONTEND_URL}/user/login`;
    await emailQueue.add("sendContractorAdminActivation", {
      to: user.email,
      subject: "Your Contractor Admin Account is Activated",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome, ${user.name}!</h2>
          <p>Your contractor admin account has been activated. You can now log in and manage your compliance documents.</p>
          <p><strong>Login Email:</strong> ${user.email}</p>
          ${plainPassword ? `<p><strong>Temporary Password:</strong> ${plainPassword}</p>` : ""}
          <p>
            <a href="${link}" style="padding: 10px 20px; background: #004b8d; color: #fff; border-radius: 4px; text-decoration: none;">Login</a>
          </p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Regards,<br/>Konnect</p>
        </div>
      `,
    });

     return res.status(200).json({
      status: 200,
      message: "Contractor admin activated and email sent.",
      user_id: user.id,
    });
  } catch (error) {
    console.error("Error in ActivateContratorAdmin:", error);
    return res.status(500).json({
      status: 500,
      message: error.message || "Internal server error.",
    });
  }
};

const getAllContractorAdmins = async (req, res) => {
  try {

    const invited_by = req.user?.id;
    if (!invited_by) {
      return res.status(400).json({ message: "User ID is required." });   
    }
    // Fetch all contractor admins who were invited by the current user

    const [results] = await sequelize.query(`
     SELECT 
        u.id AS user_id, 
        u.name AS user_name, 
        u.email AS user_email, 
        u.user_status, 
        ur.roleId, 
        r.name as role_name, 
        ci.id AS invitation_id, 
        ci.contractor_email, 
        cr.id AS registration_id, 
        cr.submission_status, 
        cr.contractor_company_name 
      FROM users u 
      INNER JOIN UserRoles ur ON ur.userId = u.id AND ur.roleId = 3
      LEFT JOIN Roles r ON r.id = ur.roleId 
      LEFT JOIN contractor_invitations ci ON ci.contractor_email = u.email 
      LEFT JOIN contractor_registration cr ON cr.contractor_invitation_id = ci.id 
      WHERE u.user_status = 1 and ci.invited_by = :invited_by
      ORDER BY u.id DESC
    `, {
      replacements: { invited_by }
    });

    res.status(200).json({
      status: 200,
      data: results,
      message: "All contractor admins fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching contractor admins:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  GetOrginazationDetails,
  OrginazationAdminLogout,
  SendIvitationLinkContractor,
  GetInviationLinksList,
  ResendInvitationEmail,
  handleContractorTokenInvitation,
  SendverificationCode,
  VerifyMultifactorAuth,
  GetDetailsInvitationDetails,
  UpdateContractorComments,
  UpdateSubmissionStatus,
  GetSubmissionPrequalification,
  UpdateInvitationStatus,
  getAllContractorAdmins,
  CompanyComplianceList,
  getComplianceDetails,
  resendEmailForDocsExpired,
  ActivateContratorAdmin
};
