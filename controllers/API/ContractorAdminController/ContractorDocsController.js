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
const Organization = require("../../../models/organization")(sequelize, DataTypes);
const organization = require("../../../models/organization");
const TradeTypeSelectDocument = require("../../../models/TradeTypeSelectDocument")(sequelize, DataTypes);
const TradeType = require("../../../models/trade_type")(sequelize, DataTypes);
const IdentityCardPdf = require("../../../PdfGenerator/identitycardpdf");

const pathToUrl = (req, relativePath) =>
  relativePath ? `${req.protocol}://${req.get('host')}/${relativePath}` : null;
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
        message: 'No contractors found',
      });
    }
    const docsPerContractor = await Promise.all(
      contractorRegisters.map(async register => {
        const invitation = await contractorInvitation.findOne({
          where: { invited_by: register.invited_by_organization },
        });
        const contractor = await ContractorRegistration.findOne({
          where: { contractor_invitation_id: invitation?.id },
        });
        const [
          safetyManagement,
          publicLiability,
          insurance,
        ] = await Promise.all([
          ContractorOrganizationSafetyManagement.findOne({
            where: {
              approved_status: 'pending',
              contractor_id: contractor?.id,
            },
          }),
          ContractorPublicLiability.findOne({
            where: {
              approved_status: 'pending',
              contractor_id: contractor?.id,
            },
          }),
          ContractorRegisterInsurance.findOne({
            where: {
              approved_status: 'pending',
              contractor_id: contractor?.id,
            },
          }),
        ]);
        const meta = {
          contractor_name: invitation?.contractor_name ?? null,
          contractor_company: contractor?.contractor_company_name ?? null,
          contractor_abn: contractor?.abn_number ?? null,
          entitydescription: contractor?.company_structure ?? null,
          Contractperson: contractor?.company_representative_first_name ?? null,
        };
        const specialDocs = [
          safetyManagement && {
            id: safetyManagement.id,
            uploaded_by_id: safetyManagement.contractor_id,
            type: 'safety_management',
            source: 'contractor_organization_safety_management',
            documentName: safetyManagement.original_file_name ?? null,
            referenceNumber: null,
            issueDate: safetyManagement.start_date ?? null,
            expiryDate: safetyManagement.end_date ?? null,
            filePath: pathToUrl(
              req,
              safetyManagement.safety_management_file_url
            ),
            fileName: safetyManagement.original_file_name,
            ...meta,
          },
          publicLiability && {
            id: publicLiability.id,
            uploaded_by_id: publicLiability.contractor_id,
            type: 'public_liability',
            source: 'contractor_public_liability',
            documentName: publicLiability.original_file_name ?? null,
            referenceNumber: publicLiability.policy_number ?? null,
            issueDate: publicLiability.start_date ?? null,
            expiryDate: publicLiability.end_date ?? null,
            filePath: pathToUrl(
              req,
              publicLiability.public_liabilty_file_url
            ),
            fileName: publicLiability.original_file_name,
            ...meta,
          },
          insurance && {
            id: insurance.id,
            uploaded_by_id: insurance.contractor_id,
            type: 'insurance',
            source: 'contractor_insurance',
            documentName: insurance.original_file_name ?? null,
            referenceNumber: insurance.policy_number ?? null,
            issueDate: insurance.start_date ?? null,
            expiryDate: insurance.end_date ?? null,
            filePath: pathToUrl(req, insurance.document_url),
            fileName: insurance.original_file_name,
            ...meta,
          },
        ].filter(Boolean);
          return [...specialDocs];
      })
    );
    const allDocuments = docsPerContractor.flat();
    return res.status(200).json({
      success: true,
      data: allDocuments,
    });
  } catch (error) {
    console.error('Error fetching contractor documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};



const updateDocumentApprovalStatus = async (req, res) => {
  try {
    const { id, type, documents_stats } = req.body;

    if (!id || !type || !documents_stats) {
      return res.status(400).json({
        success: false,
        message: 'id, type, and documents_stats query parameters are required',
      });
    }

    let model;

    switch (type) {
      case 'safety_management':
        model = ContractorOrganizationSafetyManagement;
        break;
      case 'public_liability':
        model = ContractorPublicLiability;
        break;
      case 'insurance':
        model = ContractorRegisterInsurance;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid document type',
        });
    }

    const document = await model.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    await document.update({ approved_status: documents_stats });

    return res.status(200).json({
      success: true,
      message: `Document status updated successfully to '${documents_stats}'`,
    });
  } catch (error) {
    console.error('updateDocumentApprovalStatus ➜', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


module.exports = { getAllDocumentContractor, updateDocumentApprovalStatus };
