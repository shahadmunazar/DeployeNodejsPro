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
<<<<<<< HEAD
            SELECT cd.*, cir.id AS contractor_id, cir.email, cir.first_name, 
            cir.last_name, cir.organization_name, 
            cir.mobile_no, 
            cir.address, cir.user_image, 
            cir.induction_status, cir.agree_terms, 
            ci.invite_token, creg.abn_number, 
            creg.contractor_company_name, 
            creg.contractor_trading_name, 
            creg.company_structure, 
            creg.position_at_company,
            creg.contractor_phone_number,
            creg.service_to_be_provided,
            cpl.policy_number, 
            cpl.public_liabilty_file_url, 
            cpl.original_file_name,
            cpl.start_date as public_lia_start_date,
            cpl.end_date as public_lia_end_date
          FROM contractor_documents cd LEFT JOIN contractor_induction_registration cir ON cd.contractor_reg_id = cir.id 
          LEFT JOIN contractor_invitations ci ON ci.contractor_email=cir.email 
          LEFT JOIN contractor_registration creg ON creg.contractor_invitation_id=ci.id
          LEFT JOIN contractor_public_liability cpl ON creg.id=cpl.contractor_id 
          WHERE cir.invited_by_organization = :invitedById AND ci.invited_by=:invitedById AND cir.induction_reg_type= :induction_type AND cd.approve_status = 0 AND cir.induction_reg_type = 'contractor_admin' 
          ORDER BY cd.createdAt DESC`;

=======
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
>>>>>>> fbdf74d44b801533583d18ecf945ef4a1afddb50
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

const ApprovedContractorDocuments = async (req, res) => {
  try {
    const { contractorId, documentId } = req.body;

    // Update the document's approval status
    await ContractorDocument.update(
      { approve_status: 1 },
      { where: { id: documentId, contractor_reg_id: contractorId } }
    );

    // Fetch the updated list of documents for the contractor
    const updatedDocuments = await ContractorDocument.findAll({
      where: { contractor_reg_id: contractorId },
    });

    res.status(200).json({
      success: true,
      data: updatedDocuments,
      message: "Document approved successfully",
    });
  } catch (error) {
    console.error("Error approving contractor document:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getAllDocumentContractor };
