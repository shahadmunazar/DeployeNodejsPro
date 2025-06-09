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
const ContractorRegistration = require("../../../models/ContractorRegistration")(sequelize, DataTypes);
const ContractorInductionPdf = require("../../../models/contractorinductionpdf")(sequelize, DataTypes);
const contractorInvitation = require("../../../models/contractorinvitations")(sequelize, DataTypes);
const ContractorOrganizationSafetyManagement = require("../../../models/contractororganizationsafetymanagement")(sequelize, DataTypes);
const ContractorPublicLiability = require("../../../models/contractorpublicliability")(sequelize, DataTypes);
const ContractorRegisterInsurance = require("../../../models/contractorregisterinsurance")(sequelize, DataTypes);
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
    const invitedById = req.user?.id;
    const contractorRegisters = await ContractorInductionRegistration.findAll({
      where: { invited_by_organization: invitedById },
    });
    if (!contractorRegisters.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No contractors found",
      });
    }
    const docsPerContractor = await Promise.all(
      contractorRegisters.map(async register => {
        const rawDocs = await ContractorDocument.findAll({
          where: { contractor_reg_id: register.id },
        });
        const invitation = await contractorInvitation.findOne({
          where: { invited_by: register.invited_by_organization },
        });
        const contractor = await ContractorRegistration.findOne({
          where: { contractor_invitation_id: invitation?.id },
        });
        const [safetyManagement, publicLiability, insurance] = await Promise.all([
          ContractorOrganizationSafetyManagement.findOne({ where: { contractor_id: contractor?.id } }),
          ContractorPublicLiability.findOne({ where: { contractor_id: contractor?.id } }),
          ContractorRegisterInsurance.findOne({ where: { contractor_id: contractor?.id } }),
        ]);
        const contractor_name = invitation?.contractor_name ?? null;
        const contractor_company = contractor?.contractor_company_name ?? null;
        const allDocuments = [
          ...rawDocs.map(d => ({
            id: d.id,
            uploaded_by_id: d.contractor_reg_id,
            type: d.document_type,
            source: "contractor_document",
            documentName: d.document_name,
            referenceNumber: d.reference_number,
            issueDate: d.issue_date,
            expiryDate: d.expiry_date,
            filePath: d.file_path,
            contractor_name,
            contractor_company,
          })),
          ...(safetyManagement
            ? [
                {
                  id: safetyManagement.id,
                  uploaded_by_id: safetyManagement.contractor_id,
                  type: "safety_management",
                  source: "contractor_organization_safety_management",
                  documentName: safetyManagement.original_file_name ?? null,
                  referenceNumber: null,
                  issueDate: safetyManagement.start_date ?? null,
                  expiryDate: safetyManagement.end_date ?? null,
                  filePath: safetyManagement.safety_management_file_url,
                  contractor_name,
                  contractor_company,
                },
              ]
            : []),
          ...(publicLiability
            ? [
                {
                  id: publicLiability.id,
                  uploaded_by_id: publicLiability.contractor_id,
                  type: "public_liability",
                  source: "contractor_public_liability",
                  documentName: publicLiability.original_file_name ?? null,
                  referenceNumber: publicLiability.policy_number ?? null,
                  issueDate: publicLiability.start_date ?? null,
                  expiryDate: publicLiability.end_date ?? null,
                  filePath: publicLiability.public_liabilty_file_url,
                  contractor_name,
                  contractor_company,
                },
              ]
            : []),
          ...(insurance
            ? [
                {
                  id: insurance.id,
                  uploaded_by_id: insurance.contractor_id,

                  type: "insurance",
                  source: "contractor_insurance",
                  documentName: insurance.original_file_name ?? null,
                  referenceNumber: insurance.policy_number ?? null,
                  issueDate: insurance.start_date ?? null,
                  expiryDate: insurance.end_date ?? null,
                  filePath: insurance.document_url,
                  contractor_name,
                  contractor_company,
                },
              ]
            : []),
        ];

        return allDocuments;
      })
    );
    const allDocuments = docsPerContractor.flat();
    return res.status(200).json({
      success: true,
      data: allDocuments,
    });
  } catch (error) {
    console.error("Error fetching contractor documents:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const TestDataDetails = async (req, res) => {
  try {
    // const query = `
    //    SELECT cd.*, cir.id AS contractor_id, cir.email, cir.first_name,
    //         cir.last_name, cir.organization_name,
    //         cir.mobile_no,
    //         cir.address, cir.user_image,
    //         cir.induction_status, cir.agree_terms,
    //         ci.invite_token, creg.abn_number,
    //         creg.contractor_company_name,
    //         creg.contractor_trading_name,
    //         creg.company_structure,
    //         creg.position_at_company,
    //         creg.contractor_phone_number,
    //         creg.service_to_be_provided,
    //         cpl.policy_number,
    //         cpl.public_liabilty_file_url,
    //         cpl.original_file_name,
    //         cpl.start_date as public_lia_start_date,
    //         cpl.end_date as public_lia_end_date
    //       FROM contractor_documents cd LEFT JOIN contractor_induction_registration cir ON cd.contractor_reg_id = cir.id
    //       LEFT JOIN contractor_invitations ci ON ci.contractor_email=cir.email
    //       LEFT JOIN contractor_registration creg ON creg.contractor_invitation_id=ci.id
    //       LEFT JOIN contractor_public_liability cpl ON creg.id=cpl.contractor_id
    //       WHERE cir.invited_by_organization = :invitedById AND ci.invited_by=:invitedById AND cir.induction_reg_type= :induction_type AND cd.approve_status = 0 AND cir.induction_reg_type = 'contractor_admin'
    //       ORDER BY cd.createdAt DESC
    // `;
    // const results = await sequelize.query(query, {
    //   replacements: { invitedById, induction_type },
    //   type: sequelize.QueryTypes.SELECT,
    // });
  } catch (error) {}
};

module.exports = { getAllDocumentContractor, TestDataDetails };
