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
const emailQueue = require("../../../queues/emailQueue"); 
const AuditLogContractor = require("../../../models/AuditLogContractor")(sequelize, DataTypes);
const AuditLogsContractorAdmin = require("../../../models/AuditLogsContractorAdmin")(sequelize, DataTypes);
const ContractorCompanyDocument = require("../../../models/contractor_company_document")(sequelize, DataTypes);
const pathToUrl = (req, relativePath) =>
  relativePath ? `${req.protocol}://${req.get('host')}/${relativePath}` : null;
const getAllDocumentContractor = async (req, res) => {
  try {
    const invitedById = req.user?.id;
    const contractorRegisters = await contractorInvitation.findAll({
      where: { invited_by: invitedById, status: 'accepted' },
    });
    // Check if there are any contractor registers
    // If no contractor registers found, return an empty array with a message
    if (!contractorRegisters.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No contractors found',
      });
    }
  const docsPerContractor = await Promise.all(
  contractorRegisters.map(async register => {
    const contractor = await ContractorRegistration.findOne({
      where: { contractor_invitation_id: register?.id },
    });
    const [
      // safetyManagement,
      // publicLiability,
      // insurance,
      ContractorCompanyDocuments,
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
      ContractorCompanyDocument.findAll({
        where: {
          approved_status: 'pending',
          contractor_id: contractor?.id,
        },
      }),
    ]);

    const meta = {
      contractor_name: register?.contractor_name ?? null,
      contractor_company: contractor?.contractor_company_name ?? null,
      contractor_abn: contractor?.abn_number ?? null,
      entitydescription: contractor?.company_structure ?? null,
      Contractperson: contractor?.company_representative_first_name ?? null,
    };

    // Map all company documents
    const specialDocs = ContractorCompanyDocuments.map(doc => ({
      id: doc.id,
      uploaded_by_id: doc.contractor_id,
      type: doc.document_type ?? null,
      source: 'contractor_company_document',
      document_type: doc.document_type ?? null,
      referenceNumber: doc.coverage_amount ?? null,
      issueDate: doc.start_date ?? null,
      expiryDate: doc.end_date ?? null,
      filePath: pathToUrl(req, doc.file_url),
      fileName: doc.original_file_name,
      ...meta,
    }));

    // // Add safetyManagement if exists
    // if (safetyManagement) {
    //   specialDocs.push({
    //     id: safetyManagement.id,
    //     uploaded_by_id: safetyManagement.contractor_id,
    //     type: 'safety_management',
    //     source: 'contractor_organization_safety_management',
    //     documentName: safetyManagement.original_file_name ?? null,
    //     referenceNumber: null,
    //     issueDate: safetyManagement.start_date ?? null,
    //     expiryDate: safetyManagement.end_date ?? null,
    //     filePath: pathToUrl(req, safetyManagement.safety_management_file_url),
    //     fileName: safetyManagement.original_file_name,
    //     ...meta,
    //   });
    // }

    // // Add publicLiability if exists
    // if (publicLiability) {
    //   specialDocs.push({
    //     id: publicLiability.id,
    //     uploaded_by_id: publicLiability.contractor_id,
    //     type: 'public_liability',
    //     source: 'contractor_public_liability',
    //     documentName: publicLiability.original_file_name ?? null,
    //     referenceNumber: publicLiability.policy_number ?? null,
    //     issueDate: publicLiability.start_date ?? null,
    //     expiryDate: publicLiability.end_date ?? null,
    //     filePath: pathToUrl(req, publicLiability.public_liabilty_file_url),
    //     fileName: publicLiability.original_file_name,
    //     ...meta,
    //   });
    // }

    // // Add insurance if exists
    // if (insurance) {
    //   specialDocs.push({
    //     id: insurance.id,
    //     uploaded_by_id: insurance.contractor_id,
    //     type: 'insurance',
    //     source: 'contractor_insurance',
    //     documentName: insurance.original_file_name ?? null,
    //     referenceNumber: insurance.policy_number ?? null,
    //     issueDate: insurance.start_date ?? null,
    //     expiryDate: insurance.end_date ?? null,
    //     filePath: pathToUrl(req, insurance.document_url),
    //     fileName: insurance.original_file_name,
    //     ...meta,
    //   });
    // }

    return specialDocs;
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
    const { id, type, documents_status,comments } = req.body;

    if (!id || !type || !documents_status) {
      return res.status(400).json({
        success: false,
        message: 'id, type, and documents_status query parameters are required',
      });
    }

    // let model;

    // switch (type) {
    //   case 'safety_management':
    //     model = ContractorOrganizationSafetyManagement;
    //     break;
    //   case 'public_liability':
    //     model = ContractorPublicLiability;
    //     break;
    //   case 'insurance':
    //     model = ContractorRegisterInsurance;
    //     break;
    //   default:
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Invalid document type',
    //     });
    // }

    const document = await ContractorCompanyDocument.findOne({
          where: {
            id: id,
            approved_status: { [Op.ne]: 'approved' }
          }
      });
    

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

     const contractor = await ContractorRegistration.findOne({
          where: { id: document?.contractor_id },
        }); 
        
        const contractor_Invitation = await contractorInvitation.findOne({
          where: {id: contractor?.contractor_invitation_id },
        });

        // console.log('contractor_invitation', contractor_invitation);

    await document.update({ approved_status: documents_status, seen_status: 'seen' });
      // Create an audit log entry
         const updatedComments  = (documents_status == 'approved')? 'Docs Approved successfully':comments;

                      const auditLog = await AuditLogsContractorAdmin.create({
                          contractor_id: document.contractor_id,
                          entity_type: type,
                          entity_id: document.id,
                          reviewer_id: req.user?.id,
                          reviewer_name: req.user?.name,
                          action: documents_status,
                          comments: updatedComments,
                          contractor_type: 'contractor', // for worker documents
                    });
                    // console.log('Audit Log created:', auditLog.toJSON());

      await SendDocsApprovedEmail(contractor_Invitation, auditLog, 'registration');

    return res.status(200).json({
      success: true,
      message: `Document status updated successfully to '${documents_status}'`,
    });
  } catch (error) {
    console.error('updateDocumentApprovalStatus ➜', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};


const GetAllDocumentsForWorker = async (req,res)=>{
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
        const rawDocs = await ContractorDocument.findAll({
          where: {
            approved_status: 'pending',
            contractor_reg_id: register.id,
          },
        });
        const invitation = await contractorInvitation.findOne({
          where: { invited_by: register.invited_by_organization },
        });
        const contractor = await ContractorRegistration.findOne({
          where: { contractor_invitation_id: invitation?.id },
        });   

      
        let tradeTypes = [];
          try {
       const parsed = JSON.parse(register.trade_type);
              if (Array.isArray(parsed) && parsed.length) {
                tradeTypeIds = parsed[0].split(",").map(id => Number(id.trim()));
                  tradeTypes = await TradeType.findAll({
                            where: { id: tradeTypeIds },
                            attributes: ['name', 'id'],
                          });
              }
           } catch (error) {
          console.error('Error parsing trade types:', error);
        }

        const meta = {
          worker_first_name: register?.first_name ?? null,
          worker_last_name: register?.last_name ?? null,
          mobile_no       : register?.mobile_no ?? null,
          worker_email    : register?.email ?? null,
          worker_address   : register?.address ?? null,
          contractor_company: contractor?.contractor_company_name ?? null,
          user_image:register?.user_image ?? null,
          contractor_abn: contractor?.abn_number ?? null,
          entitydescription: contractor?.company_structure ?? null,
          Contractperson: contractor?.company_representative_first_name ?? null,
        };
        const genericDocs = rawDocs.map(doc => ({
          id: doc.id,
          uploaded_by_id: doc.contractor_reg_id,
          type: doc.doc_type ?? 'misc_document',
          source: 'worker_document',
          documentName: doc.original_file_name ?? null,
          referenceNumber: doc.reference_number ?? null,
          issueDate: doc.issue_date ?? null,
          expiryDate: doc.expiry_date ?? null,
          filename: doc.filename ?? null,
          filePath: pathToUrl(req, doc.file_path),
          description:doc.document_type ?? null,
          // combine_date:issueDate+expiryDate,
          fileName: doc.expiryDate,
          ...meta,
          tradeTypes,
        }));
        return [...genericDocs];
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
}

const ApprovedWorkerDocument = async (req, res) => {
      try {
        const { id, documents_status, comments } = req.body;

        if (!id || !documents_status || !comments) {
          return res.status(400).json({
            success: false,
            message: 'id, documents_status and comments query parameters are required',
          });
        }
        // const document = await ContractorDocument.findByPk(id);
        const document = await ContractorDocument.findOne({
          where: {
            id: id,
            approved_status: { [Op.ne]: 'approved' }
          }
      });

        if (!document) {
          return res.status(404).json({
            success: false,
            message: 'Document not found',
          });
        }

        const contractor_Invitation = await ContractorInductionRegistration.findOne({
          where: {id: document?.contractor_reg_id },
        });

        await document.update({ approved_status: documents_status, seen_status: 'seen'});

        // Create an audit log entry
         const updatedComments  = (documents_status == 'approved')? 'Docs Approved successfully':comments;

                      const auditLog = await AuditLogContractor.create({
                          contractor_id: document.contractor_reg_id,
                          entity_type: document.document_type ?? 'misc_document',
                          entity_id: document.id,
                          reviewer_id: req.user?.id,
                          reviewer_name: req.user?.name,
                          action: documents_status,
                          comments: updatedComments,
                          contractor_type: 'contractor', // for worker documents
                    });
                    // console.log('Audit Log created:', auditLog.toJSON());

      await SendDocsApprovedEmail(contractor_Invitation, auditLog, 'induction');


        return res.status(200).json({
          success: true,
          message: `Document status updated successfully to '${documents_status}'`,
        });
      } catch (error) {
        console.error('updateDocumentApprovalStatus ➜', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }
}

const SendDocsApprovedEmail = async (contractorInvitation, auditLog, register_type) => {
  try {   
          let emailID, name;
          if(register_type === 'registration'){ 
              const { contractor_email, contractor_name} = contractorInvitation;
               emailID = contractor_email;
               name = contractor_name? contractor_name : "Contractor Admin";
          }else{
              const { email, first_name,last_name } = contractorInvitation;
               emailID = email;
               name = first_name ? `${first_name} ${last_name}` : "Contractor";
          }

    
    const { entity_type, action, comments } = auditLog;
    const status = action; // Assuming action is the status
  
    if (!emailID) {
      return res.status(400).json({
        status: 400,
        message: "No email found for this contractor.",
      });
    }

    const link = `${process.env.FRONTEND_URL}/user/login`;
    await emailQueue.add("SendDocsApprovedEmail", {
      to: emailID,
      subject: "Contractor Document Status Notification",
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
                <p>We have reviewed the documents submitted for your contractor ${register_type} process. Below is the status of the submitted documents:</p>
                
                <h3>Document Status: <span class="${status === 'approved' ? 'status-approved' : 'status-rejected'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></h3>
                
                <h4>Documents Reviewed:</h4>
                <ul class="document-list">
                  ${entity_type === 'safety_management' ? '<li>Safety Management Plan</li>' : ''}
                  ${entity_type === 'public_liability' ? '<li>Public Liability</li>' : ''}
                  ${entity_type === 'register_insurance' ? '<li>Register Insurance</li>' : ''}
                </ul> 
                
                <h4>Reason for Decision:</h4>
                <div class="reason">
                  <p>${comments || 'No additional comments provided.'}</p>
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
    console.error("Error in SendInductionEmail:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
};

module.exports = { getAllDocumentContractor, updateDocumentApprovalStatus,GetAllDocumentsForWorker,ApprovedWorkerDocument };
