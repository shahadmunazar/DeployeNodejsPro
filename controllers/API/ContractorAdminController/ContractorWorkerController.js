const { DataTypes, Op, Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const crypto = require("crypto");
const User = require("../../../models/user");
const UserRole = require("../../../models/userrole");
const Role = require("../../../models/role");
const moment = require('moment');
const ContractorInductionRegistration = require("../../../models/ContractorInductionRegistration")(sequelize, DataTypes);
const ContractorDocument = require("../../../models/contractor_document")(sequelize, DataTypes);
const InductionContent = require("../../../models/contractor_induction_content")(sequelize,DataTypes);
const ContractorInductionPdf = require("../../../models/contractorinductionpdf")(sequelize,DataTypes);
const ContractorInvitation = require("../../../models/contractorinvitations")(sequelize, DataTypes);
const { sendOtpEmail } = require("../../../helpers/sendOtpEmail");
const {sendConfirmationEmail} = require("../../../helpers/sendConfirmationEmail")
const { sendRegistrationOtpSms } = require("../../../helpers/smsHelper");
const { asyncSend } = require("bullmq");
const organization = require("../../../models/organization");
const TradeTypeSelectDocument = require("../../../models/TradeTypeSelectDocument")(sequelize, DataTypes);
const TradeType = require("../../../models/trade_type")(sequelize, DataTypes);
const emailQueue = require("../../../queues/emailQueue"); // Ensure the emailQueue is correctly imported

const SendIvitationLinkContractorWorker = async (req, res) => {
  try {
    let { worker_email } = req.body;

    if (!worker_email || (Array.isArray(worker_email) && worker_email.length === 0)) {
      return res.status(400).json({
        status: 400,
        message: "At least one worker email is required.",
      });
    }

    // Ensure worker_email is always an array
    if (!Array.isArray(worker_email)) {
      worker_email = [worker_email];
    }

    const results = [];
    for (const email of worker_email) {
      const existingInvite = await ContractorInvitation.findOne({
        where: {
          contractor_email: email,
          invited_by: req.user?.id,
          invitation_type: "contractor_induction",
          status: { [Op.not]: "accepted" }
        }
      });
      if (existingInvite) {
        results.push({ email, status: "already_invited" });
        continue;
      }

      const contractorInvitation = await ContractorInvitation.create({
        contractor_email: email,
        invited_by: req.user?.id,
        invitation_type: "contractor_induction",
        invite_token: crypto.randomBytes(16).toString("hex"),
        send_status: "sent",
      });

      await SendInductionEmail(contractorInvitation);
      results.push({ email, status: "invited" });
    }

    return res.status(201).json({
      status: 201,
      message: "Invitation process completed.",
      results,
    });
  } catch (error) {
    console.error("Error adding contractor workers:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const SendInductionEmail = async (contractorInvitation) => {
  try {
    const { contractor_email, contractor_name, invite_token, invited_by } = contractorInvitation;
    
    const email = contractor_email;
    const name = contractor_name? contractor_name : "Contractor";
    if (!email) {
      return res.status(400).json({
        status: 400,
        message: "No email found for this contractor.",
      });
    }

    const link = `${process.env.FRONTEND_URL}/induction-info/${invite_token}`;
    await emailQueue.add("sendInductionEmail", {
      to: email,
      subject: "Contractor Induction",
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
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Contractor Induction Invitation</h2>
            <p>Dear ${name || "Contractor"},</p>
            <p>You have been invited to complete your contractor induction process.</p>
            <p>Please click the button below to begin:</p>
            <p><a href="${link}" class="button">Start Induction</a></p>
            <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
            <p><a href="${link}">${link}</a></p>
            <p>Regards,<br/>Konnect</p>
          </div>
        </body>
        </html>
      `,
    });

     return;

  } catch (error) {
    console.error("Error in SendInductionEmail:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
};

const getRecentContractorWorkers = async (req, res) => {
  try {
    // You can adjust the limit as needed
    const limit = parseInt(req.query.limit, 10) || 10;

    const invitations = await ContractorInvitation.findAll({
      where: {
        invited_by: req.user?.id,
        invitation_type: "contractor_induction"
      },
      order: [['createdAt', 'DESC']],
      limit,
      attributes: ['contractor_email', 'contractor_name', 'status', 'createdAt'],
    });

    return res.status(200).json({
      status: 200,
      data: invitations
    });
  } catch (error) {
    console.error("Error fetching recent contractor workers:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const sendInductionNotification = async (req, res) => {
  try {
    const { userEmail, mobile_no } = req.body;

    if (!userEmail && !mobile_no) {
      return res.status(400).json({
        status: 400,
        message: "Please provide either email or mobile number.",
      });
    }

    const otp = generateSecureOTP();
    if (userEmail) {
      await sendOtpEmail(userEmail, otp);
    }
    if (mobile_no) {
      await sendRegistrationOtpSms(mobile_no, otp);
    }

    return res.status(200).json({
      status: 200,
      message: "Induction notification sent successfully.",
    });
  } catch (error) {
    console.error("Error sending induction notification:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

function generateSecureOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  const bytes = require("crypto").randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
}

module.exports = {
 SendIvitationLinkContractorWorker,getRecentContractorWorkers
};