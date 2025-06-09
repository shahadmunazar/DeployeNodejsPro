const { DataTypes, Op, Sequelize, where } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const crypto = require("crypto");
const User = require("../../../models/user");
const UserRole = require("../../../models/userrole");
const Role = require("../../../models/role");
const moment = require("moment");
const fs = require("fs");
const ContractorInductionRegistration = require("../../../models/ContractorInductionRegistration")(sequelize, DataTypes);
const ContractorDocument = require("../../../models/contractor_document")(sequelize, DataTypes);
const InductionContent = require("../../../models/contractor_induction_content")(sequelize, DataTypes);
const ContractorInductionPdf = require("../../../models/contractorinductionpdf")(sequelize, DataTypes);
const contractorInvitation = require("../../../models/contractorinvitations")(sequelize, DataTypes);

const { sendOtpEmail } = require("../../../helpers/sendOtpEmail");
const sendConfirmationEmail = require("../../../helpers/sendConfirmationEmail");
const { sendRegistrationOtpSms } = require("../../../helpers/smsHelper");
const { asyncSend } = require("bullmq");
const organization = require("../../../models/organization");
const TradeTypeSelectDocument = require("../../../models/TradeTypeSelectDocument")(sequelize, DataTypes);
const TradeType = require("../../../models/trade_type")(sequelize, DataTypes);
const IdentityCardPdf = require("../../../PdfGenerator/identitycardpdf");

const getAllDocumentContractor = async (req, res) => {
  try {
   const { induction_type } = req.query;
    const invitedById = req.user?.id;
    console.log("Invited By ID:", invitedById);

    const query = `
      SELECT 
        cd.*, 
        cir.id AS contractor_id, 
        cir.email, 
        cir.first_name, 
        cir.last_name, 
        cir.organization_name,
        cir.mobile_no,
        cir.address,
        cir.user_image,
        cir.induction_status,
        cir.agree_terms
      FROM contractor_documents cd
      LEFT JOIN contractor_induction_registration cir ON cd.contractor_reg_id = cir.id
      WHERE cir.invited_by_organization = :invitedById AND cd.approve_status = 0 AND cir.induction_reg_type = :induction_type
      ORDER BY cd.createdAt DESC
    `;

    const results = await sequelize.query(query, {
      replacements: { invitedById, induction_type },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching contractor documents:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllDocumentContractor };
