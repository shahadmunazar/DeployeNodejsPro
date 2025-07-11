const User = require("../../../models/user");
const jwt = require("jsonwebtoken");
// const UserRole = require("../../../models/userrole");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const Role = require("../../../models/role");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Op, where } = require("sequelize");
const https = require("https");

require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const generateContractorFormDetailsPdf = require("../../../PdfGenerator/generateContractorFormDetailsPdf");

const { generateContractorPdfs } = require("../../../PdfGenerator/generateContractorFormDetailsPdf");
const ContractorOrganizationSafetyManagement = require("../../../models/contractororganizationsafetymanagement")(sequelize, DataTypes);
const ContractorPublicLiability = require("../../../models/contractorpublicliability")(sequelize, DataTypes);
const ContractorRegisterInsurance = require("../../../models/contractorregisterinsurance")(sequelize, DataTypes);
const RefreshToken = require("../../../models/refreshToken")(sequelize, DataTypes);
const ContractorInvitation = require("../../../models/contractorinvitations")(sequelize, DataTypes);
const ContractorRegistration = require("../../../models/ContractorRegistration")(sequelize, DataTypes);
// const { sendPasswordResetEmail } = require("../../../utils/sendPasswordResetEmail");
const Organization = require("../../../models/organization")(sequelize, DataTypes);
// const OrganizationSubscribeUser = require("../../../models/organization_subscribeuser")(sequelize, DataTypes);
const emailQueue = require("../../../queues/emailQueue"); // Ensure the emailQueue is correctly imported
const contractorCompanyDocument = require("../../../models/contractor_company_document")(sequelize, DataTypes);
const { response } = require("express");
const {getFormIncompletePage, getRequiredDocs} = require("../../../services/contractor.service");

const formatDate = date => {
  const formattedDate = new Date(date);
  const day = String(formattedDate.getDate()).padStart(2, "0");
  const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
  const year = formattedDate.getFullYear();
  let hours = formattedDate.getHours();
  const minutes = String(formattedDate.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

const validateContractorRegistration = [
  body("contractor_invitation_id").notEmpty().isInt().withMessage("Contractor invitation ID is required"),
  body("invited_organization_by").optional().isInt(),
  body("abn_number").optional().isString(),
  body("contractor_company_name").optional().isString(),
  body("contractor_trading_name").optional().isString(),
  body("company_structure").optional().isIn(["Sole-Trader", "2-10 Employees", "11-50 Employees", "51-100 Employees", "Over 100 Employees"]),
  body("company_representative_first_name").optional().isString(),
  body("company_representative_last_name").optional().isString(),
  body("position_at_company").optional().isString(),
  body("address").optional().isString(),
  body("postal_code").optional().isString(),
  body("street").optional().isString(),
  body("suburb").optional().isString(),
  body("state").optional().isString(),
  body("contractor_phone_number")
    .optional()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Invalid phone number format"),
  body("service_to_be_provided").optional().isString(),
  body("covered_amount").optional().isInt(),
  body("have_professional_indemnity_insurance").optional().isIn(["Yes", "No", "N/A"]),
  body("is_staff_member_nominated").optional().isIn(["Yes", "No"]),
  body("provide_name_position_mobile_no").optional().isString(),
  body("are_employees_provided_with_health_safety").optional().isIn(["Yes", "No"]),
  body("are_employees_appropriately_licensed_qualified_safety").optional().isIn(["Yes", "No", "N/A"]),
  body("are_employees_confirmed_as_competent_to_undertake_work").optional().isIn(["Yes", "No"]),
  body("do_you_all_sub_contractor_qualified_to_work").optional().isIn(["Yes", "No", "N/A"]),
  body("do_you_all_sub_contractor_required_insurance_public_liability").optional().isIn(["Yes", "No", "N/A"]),
  body("have_you_identified_all_health_safety_legislation").optional().isIn(["Yes", "No", "N/A"]),
  body("do_you_have_emergency_response").optional().isIn(["Yes", "No", "N/A"]),
  body("do_you_have_procedures_to_notify_the_applicable").optional().isIn(["Yes", "No", "N/A"]),
  body("do_you_have_SWMS_JSAS_or_safe_work").optional().isIn(["Yes", "No", "N/A"]),
  body("do_your_workers_conduct_on_site_review").optional().isIn(["Yes", "No"]),
  body("do_you_regularly_monitor_compliance").optional().isIn(["Yes", "No"]),
  body("do_you_have_procedures_circumstances").optional().isIn(["Yes", "No"]),
  body("have_you_been_prosecuted_health_regulator").optional().isIn(["Yes", "No"]),
  body("submission_status").optional().isIn(["confirm_submit", "let_me_check", "i_do_it_later", "save_and_come_back_later"]),
  body("employee_insure_doc_id").optional().isInt(),
  body("public_liability_doc_id").optional().isInt(),
  body("organization_safety_management_id").optional().isInt(),
];

const CreateContractorRegistration = async (req, res) => {
  try {
    await Promise.all(validateContractorRegistration.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { id, contractor_invitation_id, abn_number, new_start } = req.body;
    let existing = null;
    if (id) {
      existing = await ContractorRegistration.findOne({ where: { id } });
    }

    if (!existing && !new_start) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Contractor registration not found and new_start is false.",
      });
    }

    if (contractor_invitation_id) {
      const invitationExists = await ContractorInvitation.findOne({
        where: { id: contractor_invitation_id },
      });

      if (!invitationExists) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: "Invalid contractor_invitation_id: no matching record found.",
        });
      }
    }

    const updatableFields = [
      "contractor_invitation_id",
      "invited_organization_by",
      "abn_number",
      "contractor_company_name",
      "contractor_trading_name",
      "company_structure",
      "company_representative_first_name",
      "company_representative_last_name",
      "position_at_company",
      "address",
      "street",
      "suburb",
      "postal_code",
      "state",
      "contractor_phone_number",
      "service_to_be_provided",
      "covered_amount",
      "have_professional_indemnity_insurance",
      "is_staff_member_nominated",
      "provide_name_position_mobile_no",
      "are_employees_provided_with_health_safety",
      "are_employees_appropriately_licensed_qualified_safety",
      "are_employees_confirmed_as_competent_to_undertake_work",
      "do_you_all_sub_contractor_qualified_to_work",
      "do_you_all_sub_contractor_required_insurance_public_liability",
      "have_you_identified_all_health_safety_legislation",
      "do_you_have_emergency_response",
      "do_you_have_procedures_to_notify_the_applicable",
      "do_you_have_SWMS_JSAS_or_safe_work",
      "do_your_workers_conduct_on_site_review",
      "do_you_regularly_monitor_compliance",
      "do_you_have_procedures_circumstances",
      "have_you_been_prosecuted_health_regulator",
      "submission_status",
      "employee_insure_doc_id",
      "public_liability_doc_id",
      "organization_safety_management_id",
    ];

    const fieldsToUse = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUse[field] = req.body[field];
      }
    });

    if (new_start === true || !existing) {
      if (abn_number) {
        const abnExists = await ContractorRegistration.findOne({
          where: {
            abn_number,
          },
        });
        if (abnExists) {
          return res.status(400).json({
            success: false,
            status: 400,
            message: "This ABN number is already used by another contractor.",
          });
        }
      }
      if (existing) {
        fieldsToUse.contractor_invitation_id = existing.contractor_invitation_id;
        fieldsToUse.invited_organization_by = existing.invited_organization_by;
      }

      const newRegistration = await ContractorRegistration.create(fieldsToUse);

      return res.status(200).json({
        success: true,
        status: 200,
        message: "New contractor registration created successfully.",
        data: newRegistration,
      });
    } else {
      if (abn_number && abn_number !== existing.abn_number) {
        const abnExists = await ContractorRegistration.findOne({
          where: {
            abn_number,
            id: { [Op.ne]: id },
          },
        });

        // if (abnExists) {
        //   return res.status(400).json({
        //     success: false,
        //     message: "This ABN number is already used by another contractor.",
        //   });
        // }
      }

      await existing.update(fieldsToUse);

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Contractor registration updated successfully.",
        data: existing,
      });
    }
  } catch (error) {
    console.error("Error in ContractorRegistration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const UploadContractorCompanyDocument = async (req, res) => {
  try { 

    const { contractor_id, covered_amount, end_date, document_type } = req.body;
    const coverage_amount = covered_amount ? covered_amount : null;

    if (!contractor_id || !end_date || !document_type) {
      return res.status(400).json({ message: "Contractor ID, coverage amount, end date, and document type are required." });
    }

    if (document_type === 'public_liability' && !coverage_amount) {
      return res.status(400).json({ message: "Coverage amount is required for public liability." });
    }


    const file = req.files?.contractor_company_document?.[0];
    if (!file) {
      return res.status(400).json({ message: "Company document file is required." });
    }

    const document_url = file.path.replace(/\\/g, "/");
    const original_file_name = file.originalname;

    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });

    if (!contractor) {
      return res.status(404).json({ message: "Contractor not found." });
    }

    let companyDocument = await contractorCompanyDocument.findOne({
      where: { contractor_id, document_type   },  
    });

    if (companyDocument) {
      await companyDocument.update({
        coverage_amount,
        end_date,
        document_type,
        file_url: document_url,
        original_file_name,
      });
    } else {
      companyDocument = await contractorCompanyDocument.create({
        contractor_id,
        coverage_amount,
        end_date,
        document_type,
        file_url: document_url,
        original_file_name,
      });
    }
            // Update the contractor's reference to the company document  

            const fieldMap = {
                    contractor_insurance: 'employee_insure_doc_id',
                    public_liability: 'public_liability_doc_id',
                    safety_contractor_managment: 'organization_safety_management_id',
                  };

            const field = fieldMap[document_type];
            if (field) {
              await contractor.update({ [field]: companyDocument.id });
            }

    return res.status(200).json({ 
      success: true,
      status: 200,
      message: "Contractor company document uploaded and updated successfully.",
      data: companyDocument, 
    });

  } catch (err) { 
    console.error("UploadContractorCompanyDocument error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });

  }

}

const UploadInsuranceContrator = async (req, res) => {
  try {
    const { contractor_id, end_date, covered_amount } = req.body;

    if (!contractor_id || !end_date) {
      return res.status(400).json({ message: "Contractor ID and insurance end date are required." });
    }

    const file = req.files?.contractor_insurance?.[0];
    if (!file) {
      return res.status(400).json({ message: "Insurance document file is required." });
    }

    const document_url = file.path.replace(/\\/g, "/");
    const original_file_name = file.originalname;

    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });

    if (!contractor) {
      return res.status(404).json({ message: "Contractor not found." });
    }

    let insuranceRecord = await ContractorRegisterInsurance.findOne({
      where: { contractor_id },
    });

    if (insuranceRecord) {
      await insuranceRecord.update({
        end_date,
        coverage_amount: covered_amount,
        document_url,
        original_file_name,
      });
    } else {
      insuranceRecord = await ContractorRegisterInsurance.create({
        contractor_id,
        end_date,
        coverage_amount: covered_amount,
        document_url,
        original_file_name,
      });
    }

    await contractor.update({
      employee_insure_doc_id: insuranceRecord.id,
      covered_amount: covered_amount,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Contractor insurance uploaded and updated successfully.",
      data: insuranceRecord,
    });
  } catch (err) {
    console.error("UploadInsuranceContrator error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const UploadPublicLiability = async (req, res) => {
  try {
    const { contractor_id, end_date, covered_amount } = req.body;

    if (!contractor_id || !end_date) {
      return res.status(400).json({ message: "Contractor ID and insurance end date are required." });
    }

    const file = req.files?.contractor_liability?.[0];
    if (!file) {
      return res.status(400).json({ message: "Public liability document file is required." });
    }

    const public_liabilty_file_url = file.path.replace(/\\/g, "/");
    const original_file_name = file.originalname;

    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });

    if (!contractor) {
      return res.status(404).json({ message: "Contractor not found." });
    }
    let liabilityRecord = await ContractorPublicLiability.findOne({
      where: { contractor_id },
    });

    if (liabilityRecord) {
      await liabilityRecord.update({
        end_date,
        public_liabilty_file_url,
        original_file_name,
      });
    } else {
      liabilityRecord = await ContractorPublicLiability.create({
        contractor_id,
        end_date,
        public_liabilty_file_url,
        original_file_name,
      });
    }
    await contractor.update({
      public_liability_doc_id: liabilityRecord.id,
      covered_amount: covered_amount,
    });
    return res.status(200).json({
      status: 200,
      message: "Contractor public liability insurance uploaded and updated successfully.",
      data: liabilityRecord,
    });
  } catch (err) {
    console.error("UploadPublicLiability error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

const UploadSafetyMNContractor = async (req, res) => {
  try {
    const { contractor_id } = req.body;
    if (!contractor_id) {
      return res.status(400).json({
        success: false,
        message: "Contractor ID is required.",
      });
    }
    const file = req.files?.safety_contractor_managment?.[0];
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Safety management document file is required.",
      });
    }
    const does_organization_safety_management_system_filename = file.path.replace(/\\/g, "/");
    const original_file_name = file.originalname;
    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });
    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: "Contractor not found.",
      });
    }
    let safetyRecord = await ContractorOrganizationSafetyManagement.findOne({
      where: { contractor_id },
    });
    if (safetyRecord) {
      await safetyRecord.update({
        does_organization_safety_management_system_filename,
        original_file_name,
      });
    } else {
      safetyRecord = await ContractorOrganizationSafetyManagement.create({
        contractor_id,
        does_organization_safety_management_system_filename,
        original_file_name,
      });
    }
    await contractor.update({
      organization_safety_management_id: safetyRecord.id,
    });
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Contractor safety management document uploaded and updated successfully.",
      data: safetyRecord,
    });
  } catch (err) {
    console.error("UploadSafetyMNContractor error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// const GetInsuranceContractor = async (req, res) => {
//   try {
//     const { contractor_id } = req.query;

//     if (!contractor_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Contractor ID is required",
//       });
//     }

//     const findInsDet = await ContractorRegisterInsurance.findOne({
//       where: {
//         contractor_id: contractor_id,
//       },
//     });

//     if (!findInsDet) {
//       return res.status(404).json({
//         success: false,
//         message: "No insurance details found for this contractor.",
//       });
//     }

//     const full_doc_url = findInsDet.document_url;
//     const full_url = `${process.env.BACKEND_URL}/${full_doc_url}`;

//     return res.status(200).json({
//       success: true,
//       status: 200,
//       message: "Contractor insurance details retrieved successfully.",
//       data: findInsDet,
//       fullUrl: full_url,
//     });
//   } catch (error) {
//     console.error("Error in GetInsuranceContractor:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

//All type public insurance

const GetInsuranceContractor = async (req, res) => {
  try {
    const { contractor_id, type } = req.query;

    if (!contractor_id || !type) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Contractor ID and document type are required.",
      });
    }

    let model, fieldName, notFoundMessage, successMessage;

    switch (type) {
      case "insurance":
        model = ContractorRegisterInsurance;
        fieldName = "document_url";
        notFoundMessage = "No insurance details found for this contractor.";
        successMessage = "Contractor insurance details retrieved successfully.";
        break;

      case "public":
        model = ContractorPublicLiability;
        fieldName = "public_liabilty_file_url";
        notFoundMessage = "No public liability insurance details found for this contractor.";
        successMessage = "Contractor public liability details retrieved successfully.";
        break;

      case "safety":
        model = ContractorOrganizationSafetyManagement;
        fieldName = "does_organization_safety_management_system_filename";
        notFoundMessage = "No safety management details found for this contractor.";
        successMessage = "Contractor safety management details retrieved successfully.";
        break;
      default:
        return res.status(400).json({
          success: false,
          status: 400,
          message: "Invalid type. Valid types are: insurance, public, safety.",
        });
    }

    const record = await model.findOne({ where: { contractor_id } });

    if (!record) {
      return res.status(404).json({ status: 404, success: false, message: notFoundMessage });
    }

    const documentPath = record[fieldName];
    const fullUrl = `${process.env.BACKEND_URL}/${documentPath}`;

    return res.status(200).json({
      success: true,
      status: 200,
      message: successMessage,
      data: record,
      fullUrl,
    });
  } catch (error) {
    console.error("GetContractorDocument error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const GetPublicLiabilityContractor = async (req, res) => {
  try {
    const { contractor_id } = req.query;

    if (!contractor_id) {
      return res.status(400).json({
        success: false,
        message: "Contractor ID is required",
      });
    }

    const findInsDet = await ContractorPublicLiability.findOne({
      where: {
        contractor_id: contractor_id,
      },
    });

    if (!findInsDet) {
      return res.status(404).json({
        success: false,
        message: "No insurance details found for this contractor.",
      });
    }

    const full_doc_url = findInsDet.document_url;
    const full_url = `${process.env.BACKEND_URL}/${full_doc_url}`;

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Contractor public liability insurance details retrieved successfully.",
      data: findInsDet,
      fullUrl: full_url,
    });
  } catch (error) {
    console.error("Error in GetPublicLiabilityContractor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const GetSafetyMangmentContractor = async (req, res) => {
  try {
    const { contractor_id } = req.query;

    if (!contractor_id) {
      return res.status(400).json({
        success: false,
        message: "Contractor ID is required",
      });
    }

    const findInsDet = await ContractorOrganizationSafetyManagement.findOne({
      where: {
        contractor_id: contractor_id,
      },
    });

    if (!findInsDet) {
      return res.status(404).json({
        success: false,
        message: "No safety management details found for this contractor.",
      });
    }

    const full_doc_url = findInsDet.document_url;
    const full_url = `${process.env.BACKEND_URL}/${full_doc_url}`;

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Contractor safety management details retrieved successfully.",
      data: findInsDet,
      fullUrl: full_url,
    });
  } catch (error) {
    console.error("Error in GetSafetyManagementContractor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const DeleteInsuranceContrator = async (req, res) => {
  try {
    const { contractor_id, type } = req.body;

    if (!contractor_id || !type) {
      return res.status(400).json({
        success: false,
        message: "Contractor ID and document type are required.",
      });
    }
    const documentMap = {
      employee_insurance: {
        model: ContractorRegisterInsurance,
        field: "employee_insure_doc_id",
        label: "Employee Insurance",
      },
      public_liability: {
        model: ContractorPublicLiability,
        field: "public_liability_doc_id",
        label: "Public Liability",
      },
      safety_management: {
        model: ContractorOrganizationSafetyManagement,
        field: "organization_safety_management_id",
        label: "Safety Management",
      },
    };
    const documentConfig = documentMap[type];
    console.log("doc", documentConfig);
    if (!documentConfig) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type provided.",
      });
    }
    const insuranceRecord = await documentConfig.model.findOne({
      where: { contractor_id },
    });
    console.log("ins", insuranceRecord);
    if (!insuranceRecord) {
      return res.status(404).json({
        success: false,
        message: `No ${documentConfig.label} record found for this contractor.`,
      });
    }
    await insuranceRecord.destroy();
    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });
    if (contractor) {
      await contractor.update({ [documentConfig.field]: null });
    }
    return res.status(200).json({
      success: true,
      status: 200,
      message: `${documentConfig.label} record deleted and contractor reference updated.`,
    });
  } catch (error) {
    console.error("DeleteContractorDocument error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const DeletePublicLContrator = async (req, res) => {
  try {
    const { contractor_id } = req.body;
    if (!contractor_id) {
      return res.status(400).json({
        success: false,
        message: "Contractor ID is required.",
      });
    }
    const insuranceRecord = await ContractorPublicLiability.findOne({
      where: { contractor_id },
    });
    console.log("CheckData", insuranceRecord);
    if (!insuranceRecord) {
      return res.status(404).json({
        success: false,
        message: "No insurance record found for this contractor.",
      });
    }
    await insuranceRecord.destroy();
    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });

    if (contractor) {
      await contractor.update({ public_liability_doc_id: null });
    }
    return res.status(200).json({
      success: true,
      message: "Insurance record deleted and contractor reference updated.",
    });
  } catch (error) {
    console.error("DeleteInsuranceContrator error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const DeleteSafetyMContrator = async (req, res) => {
  try {
    const { contractor_id } = req.body;
    if (!contractor_id) {
      return res.status(400).json({
        success: false,
        message: "Contractor ID is required.",
      });
    }
    const insuranceRecord = await ContractorOrganizationSafetyManagement.findOne({
      where: { contractor_id },
    });
    console.log("CheckData", insuranceRecord);
    if (!insuranceRecord) {
      return res.status(404).json({
        success: false,
        message: "No insurance record found for this contractor.",
      });
    }
    await insuranceRecord.destroy();
    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });

    if (contractor) {
      await contractor.update({ organization_safety_management_id: null });
    }
    return res.status(200).json({
      success: true,
      message: "Insurance record deleted and contractor reference updated.",
    });
  } catch (error) {
    console.error("DeleteInsuranceContrator error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const CheckContractorRegisterStatus = async (req, res) => {
    try {
        const {contractor_invitation_id} = req.query;
        if (!contractor_invitation_id) {
            return res.status(400).json({message: "Contractor invitation ID is required."});
        }

        const getTimeAgo = timestamp => {
            const now = new Date();
            const past = new Date(timestamp);
            const diffInMs = now - past;
            const seconds = Math.floor(diffInMs / 1000);
            const minutes = Math.floor(diffInMs / (1000 * 60));
            const hours = Math.floor(diffInMs / (1000 * 60 * 60));
            const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            const months = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
            const years = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));

            if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
            if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
            if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
            if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
            if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
            return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
        };

        const registrations = await ContractorRegistration.findAll({
            where: {contractor_invitation_id},
            attributes: [
                "id",
                "invited_organization_by",
                "abn_number",
                "contractor_company_name",
                "contractor_trading_name",
                "company_structure",
                "company_representative_first_name",
                "company_representative_last_name",
                "position_at_company",
                "address",
                "street",
                "postal_code",
                "suburb",
                "state",
                "contractor_phone_number",
                "service_to_be_provided",
                "employee_insure_doc_id",
                "public_liability_doc_id",
                "organization_safety_management_id",
                "submission_status",
                "updatedAt",
                "covered_amount",
                "have_professional_indemnity_insurance",
                "is_staff_member_nominated",
                "provide_name_position_mobile_no",
                "are_employees_provided_with_health_safety",
                "are_employees_appropriately_licensed_qualified_safety",
                "are_employees_confirmed_as_competent_to_undertake_work",
                "do_you_all_sub_contractor_qualified_to_work",
                "do_you_all_sub_contractor_required_insurance_public_liability",
                "have_you_identified_all_health_safety_legislation",
                "do_you_have_emergency_response",
                "do_you_have_procedures_to_notify_the_applicable",
                "do_you_have_SWMS_JSAS_or_safe_work",
                "do_your_workers_conduct_on_site_review",
                "do_you_regularly_monitor_compliance",
                "do_you_have_procedures_circumstances",
                "have_you_been_prosecuted_health_regulator",
            ],
        });

        if (!registrations || registrations.length === 0) {
            return res.status(200).json({
                registered: false,
                message: "No contractor registration found for the provided invitation ID.",
            });
        }

        const enrichedData = await Promise.all(registrations.map(async registration => {
            const plain = registration.toJSON();

            const requiredPage1Fields = [
                "abn_number",
                "contractor_company_name",
                "contractor_trading_name",
                "company_structure",
                "company_representative_first_name",
                "company_representative_last_name",
                "position_at_company",
                "address",
                "street",
                "suburb",
                "state",
                "contractor_phone_number",
                "service_to_be_provided",
            ];

            const requiredPage5Fields = [
                "have_professional_indemnity_insurance",
                "is_staff_member_nominated",
                "provide_name_position_mobile_no",
                "are_employees_provided_with_health_safety",
                "are_employees_appropriately_licensed_qualified_safety",
                "are_employees_confirmed_as_competent_to_undertake_work",
                "do_you_all_sub_contractor_qualified_to_work",
                "do_you_all_sub_contractor_required_insurance_public_liability",
                "have_you_identified_all_health_safety_legislation",
                "do_you_have_emergency_response",
                "do_you_have_procedures_to_notify_the_applicable",
                "do_you_have_SWMS_JSAS_or_safe_work",
                "do_your_workers_conduct_on_site_review",
                "do_you_regularly_monitor_compliance",
                "do_you_have_procedures_circumstances",
                "have_you_been_prosecuted_health_regulator",
                "employee_insure_doc_id",
                "public_liability_doc_id",
                // "organization_safety_management_id",
            ];

            let formStatus = "";
            let incompletePage = null;
            // console.log("plain",plain);
            // form status check for steps
            switch (plain.submission_status) {
                case "confirm_submit":
                    const {employeeInsuranceDoc, publicLiabilityDoc, safetyDoc} = await getRequiredDocs(plain);
                    if (
                        employeeInsuranceDoc.approved_status === "rejected"
                    ) {
                        incompletePage = 2;
                    } else if (
                        publicLiabilityDoc.approved_status === "rejected"
                    ) {
                        incompletePage = 3;
                    } else if (
                        safetyDoc.approved_status === "rejected"
                    ) {
                        incompletePage = 5;
                    }
                    const isAnyDocRejected =
                        employeeInsuranceDoc?.approved_status === "rejected" ||
                        publicLiabilityDoc?.approved_status === "rejected" ||
                        safetyDoc?.approved_status === "rejected";

                    if (isAnyDocRejected) {
                        formStatus = "pending";
                    } else {
                        formStatus = "complete";
                    }

                    break;
                case "approved":
                    formStatus = "Approved";
                    break;
                case "rejected":
                    formStatus = "Rejected";
                    break;
                case "save":
                    formStatus = "Save";
                    break;
                case "let_me_check":
                    formStatus = "Let Me Check";
                    break;
                case "i_do_it_later":
                    formStatus = "I do it Later";
                    break;
                case "save_and_come_back_later":
                    formStatus = "Save and come Back Later";
                    break;
                case "pause":
                    formStatus = "Paused";
                    break;
                default:
                    console.log("hit in default")
                    // Check for incomplete form logic
                    // const isPage1Incomplete = requiredPage1Fields.some(field => !plain[field]);
                    // const isPage5Incomplete = requiredPage5Fields.some(field => plain[field]);
                    // console.log("isPage1Incomplete", isPage1Incomplete);
                    // console.log("plain", plain);
                    // formStatus = "pending";
                    // if (isPage1Incomplete) {
                    //   incompletePage = 1;
                    // } else if (!plain.employee_insure_doc_id) {
                    //   if (plain.public_liability_doc_id && plain.organization_safety_management_id) {
                    //     incompletePage = isPage5Incomplete ? 5 : 5;
                    //   } else if (plain.public_liability_doc_id) {
                    //     incompletePage = 4;
                    //   } else {
                    //     incompletePage = 2;
                    //   }
                    // } else if (!plain.public_liability_doc_id) {
                    //   incompletePage = 3;
                    // } else if (!plain.organization_safety_management_id) {
                    //   incompletePage = 4;
                    // } else if (isPage5Incomplete) {
                    //   incompletePage = 5;
                    // } else {
                    //   formStatus = "complete";
                    // }
                    // break;
                    incompletePage = await getFormIncompletePage(plain, requiredPage1Fields, requiredPage5Fields);
                    formStatus = incompletePage ? "pending" : "complete";

            }

            return {
                ...plain,
                lastUpdatedAgo: getTimeAgo(plain.updatedAt),
                incompletePage,
                formStatus,
            };
        }));
        return res.status(200).json({
            registered: true,
            status: 200,
            data: enrichedData,
        });
    } catch (error) {
        console.error("Error checking contractor registration status:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
// const CheckContractorRegisterStatus = async (req, res) => {
//   try {
//     const { contractor_invitation_id } = req.query;
//     if (!contractor_invitation_id) {
//       return res.status(400).json({ message: "Contractor invitation ID is required." });
//     }

//     const getTimeAgo = timestamp => {
//       const now = new Date();
//       const past = new Date(timestamp);
//       const diffInMs = now - past;
//       const seconds = Math.floor(diffInMs / 1000);
//       const minutes = Math.floor(diffInMs / (1000 * 60));
//       const hours = Math.floor(diffInMs / (1000 * 60 * 60));
//       const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
//       const months = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
//       const years = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));

//       if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
//       if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
//       if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
//       if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
//       if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
//       return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
//     };

//     const registrations = await ContractorRegistration.findAll({
//       where: { contractor_invitation_id },
//       attributes: [
//         "id",
//         "invited_organization_by",
//         "abn_number",
//         "contractor_company_name",
//         "contractor_trading_name",
//         "company_structure",
//         "company_representative_first_name",
//         "company_representative_last_name",
//         "position_at_company",
//         "address",
//         "street",
//         "postal_code",
//         "suburb",
//         "state",
//         "contractor_phone_number",
//         "service_to_be_provided",
//         "employee_insure_doc_id",
//         "public_liability_doc_id",
//         "organization_safety_management_id",
//         "submission_status",
//         "updatedAt",
//         "covered_amount",
//         "have_professional_indemnity_insurance",
//         "is_staff_member_nominated",
//         "provide_name_position_mobile_no",
//         "are_employees_provided_with_health_safety",
//         "are_employees_appropriately_licensed_qualified_safety",
//         "are_employees_confirmed_as_competent_to_undertake_work",
//         "do_you_all_sub_contractor_qualified_to_work",
//         "do_you_all_sub_contractor_required_insurance_public_liability",
//         "have_you_identified_all_health_safety_legislation",
//         "do_you_have_emergency_response",
//         "do_you_have_procedures_to_notify_the_applicable",
//         "do_you_have_SWMS_JSAS_or_safe_work",
//         "do_your_workers_conduct_on_site_review",
//         "do_you_regularly_monitor_compliance",
//         "do_you_have_procedures_circumstances",
//         "have_you_been_prosecuted_health_regulator",
//       ],
//     });

//     if (!registrations || registrations.length === 0) {
//       return res.status(200).json({
//         registered: false,
//         message: "No contractor registration found for the provided invitation ID.",
//       });
//     }

//     const enrichedData = registrations.map(registration => {
//       const plain = registration.toJSON();

//       const requiredPage1Fields = [
//         "abn_number",
//         "contractor_company_name",
//         "contractor_trading_name",
//         "company_structure",
//         "company_representative_first_name",
//         "company_representative_last_name",
//         "position_at_company",
//         "address",
//         "street",
//         "suburb",
//         "state",
//         "contractor_phone_number",
//         "service_to_be_provided",
//       ];

//       const requiredPage5Fields = [
//         "have_professional_indemnity_insurance",
//         "is_staff_member_nominated",
//         "provide_name_position_mobile_no",
//         "are_employees_provided_with_health_safety",
//         "are_employees_appropriately_licensed_qualified_safety",
//         "are_employees_confirmed_as_competent_to_undertake_work",
//         "do_you_all_sub_contractor_qualified_to_work",
//         "do_you_all_sub_contractor_required_insurance_public_liability",
//         "have_you_identified_all_health_safety_legislation",
//         "do_you_have_emergency_response",
//         "do_you_have_procedures_to_notify_the_applicable",
//         "do_you_have_SWMS_JSAS_or_safe_work",
//         "do_your_workers_conduct_on_site_review",
//         "do_you_regularly_monitor_compliance",
//         "do_you_have_procedures_circumstances",
//         "have_you_been_prosecuted_health_regulator",
//         "employee_insure_doc_id",
//         "public_liability_doc_id",
//         // "organization_safety_management_id",
//       ];

//       let formStatus = "";
//       let incompletePage = null;
//   // console.log("plain",plain);
//       switch (plain.submission_status) {
//         case "confirm_submit":
//           formStatus = "complete";
//           break;
//         case "approved":
//           formStatus = "Approved";
//           break;
//         case "rejected":
//           formStatus = "Rejected";
//           break;
//         case "save":
//           formStatus = "Save";
//           break;
//         case "let_me_check":
//           formStatus = "Let Me Check";
//           break;
//         case "i_do_it_later":
//           formStatus = "I do it Later";
//           break;
//         case "save_and_come_back_later":
//           formStatus = "Save and come Back Later";
//           break;
//         case "pause":
//           formStatus = "Paused";
//           break;
//         default:
//           // Check for incomplete form logic
//           const isPage1Incomplete = requiredPage1Fields.some(field => !plain[field]);
//           const isPage5Incomplete = requiredPage5Fields.some(field => plain[field]);
//           // console.log("isPage1Incomplete", isPage1Incomplete);
//           // console.log("plain", plain);
//         formStatus = "pending";
//           if (isPage1Incomplete) {
//             incompletePage = 1;
//           } else if (!plain.employee_insure_doc_id) {
//             if (plain.public_liability_doc_id && plain.organization_safety_management_id) {
//               incompletePage = isPage5Incomplete ? 5 : 5;
//             } else if (plain.public_liability_doc_id) {
//               incompletePage = 4;
//             } else {
//               incompletePage = 2;
//             }
//           } else if (!plain.public_liability_doc_id) {
//             incompletePage = 3;
//           } else if (!plain.organization_safety_management_id) {
//             incompletePage = 4;
//           } else if (isPage5Incomplete) {
//             incompletePage = 5;
//           } else {
//             formStatus = "complete";
//           }
//           break;
//       }

//       return {
//         ...plain,
//         lastUpdatedAgo: getTimeAgo(plain.updatedAt),
//         incompletePage,
//         formStatus,
//       };
//     });

//     return res.status(200).json({
//       registered: true,
//       status: 200,
//       data: enrichedData,
//     });
//   } catch (error) {
//     console.error("Error checking contractor registration status:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

const DeleteContractorRecords = async (req, res) => {
  try {
    const { contractor_id } = req.body;
    if (!contractor_id) {
      return res.status(400).json({ message: "Contractor ID is required." });
    }
    const contractorReg = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });
    if (!contractorReg) {
      return res.status(404).json({ message: "Contractor registration not found." });
    }
    await ContractorRegisterInsurance.destroy({
      where: { contractor_id: contractorReg.id },
    });
    await ContractorPublicLiability.destroy({
      where: { contractor_id: contractorReg.id },
    });
    await ContractorOrganizationSafetyManagement.destroy({
      where: { contractor_id: contractorReg.id },
    });
    await ContractorRegistration.destroy({
      where: { id: contractorReg.id },
    });
    return res.status(200).json({ status: 200, success: true, message: "Contractor registration and related documents deleted successfully." });
  } catch (error) {
    console.error("Error deleting contractor registration:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const GetContractorDetails = async (req, res) => {
  try {
    const { contractor_id } = req.query;
    if (!contractor_id) {
      return res.status(400).json({
        success: false,
        message: "Contractor ID is required.",
      });
    }
    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
      raw: true,
    });
    if (!contractor) {
      return res.status(404).json({
        success: false,
        message: "Contractor not found.",
      });
    }
    const insurance = await ContractorRegisterInsurance.findOne({
      where: { contractor_id: contractor.id },
      raw: true,
    });
    const publicLiability = await ContractorPublicLiability.findOne({
      where: { contractor_id: contractor.id },
      raw: true,
    });
    const safetyManagement = await ContractorOrganizationSafetyManagement.findOne({
      where: { contractor_id: contractor.id },
      raw: true,
    });
    const requiredPage1Fields = [
      "abn_number",
      "contractor_company_name",
      "contractor_trading_name",
      "company_structure",
      "company_representative_first_name",
      "company_representative_last_name",
      "position_at_company",
      "address",
      "street",
      "suburb",
      "state",
      "contractor_phone_number",
      "service_to_be_provided",
    ];
    const requiredPage5Fields = [
      "have_professional_indemnity_insurance",
      "is_staff_member_nominated",
      "provide_name_position_mobile_no",
      "are_employees_provided_with_health_safety",
      "are_employees_appropriately_licensed_qualified_safety",
      "are_employees_confirmed_as_competent_to_undertake_work",
      "do_you_all_sub_contractor_qualified_to_work",
      "do_you_all_sub_contractor_required_insurance_public_liability",
      "have_you_identified_all_health_safety_legislation",
      "do_you_have_emergency_response",
      "do_you_have_procedures_to_notify_the_applicable",
      "do_you_have_SWMS_JSAS_or_safe_work",
      "do_your_workers_conduct_on_site_review",
      "do_you_regularly_monitor_compliance",
      "do_you_have_procedures_circumstances",
      "have_you_been_prosecuted_health_regulator",
    ];
    let incompletePage = null;
    let formStatus = "incomplete";
    if (contractor.submission_status === "confirm_submit") {
      formStatus = "complete";
    } else {
      const isPage1Incomplete = requiredPage1Fields.some(field => !contractor[field]);
      const isPage5Incomplete = requiredPage5Fields.some(field => !contractor[field]);
      if (isPage1Incomplete) {
        incompletePage = 1;
      } else if (!contractor.employee_insure_doc_id) {
        incompletePage = 2;
      } else if (!contractor.public_liability_doc_id) {
        incompletePage = 3;
      } else if (!contractor.organization_safety_management_id) {
        incompletePage = 4;
      } else if (isPage5Incomplete) {
        incompletePage = 5;
      } else {
        formStatus = "complete";
      }
    }
    const SERVER_BASE_URL = process.env.BACKEND_URL || "http://13.238.194.121:5000/";
    const mergedData = {
      ...contractor,
      Insuranceid: insurance?.id || null,
      coverage_amount_insurance: insurance?.coverage_amount || null,
      original_file_name_insurance: insurance?.original_file_name || null,
      end_date_insurance_formatted: insurance?.end_date ? formatDate(insurance.end_date) : null,
      full_doc_url_insurance: insurance?.document_url ? SERVER_BASE_URL + insurance.document_url : null,
      publicid: publicLiability?.id || null,
      policy_number_public: publicLiability?.policy_number || null,
      provider_public: publicLiability?.provider || null,
      original_file_name_public_liability: publicLiability?.original_file_name || null,
      end_date_public_formatted: publicLiability?.end_date ? formatDate(publicLiability.end_date) : null,
      full_doc_url_public_liability: publicLiability?.public_liabilty_file_url ? SERVER_BASE_URL + publicLiability.public_liabilty_file_url : null,
      Safetyid: safetyManagement?.id || null,
      original_file_name_safety: safetyManagement?.original_file_name || null,
      full_doc_url_safety: safetyManagement?.does_organization_safety_management_system_filename
        ? SERVER_BASE_URL + safetyManagement.does_organization_safety_management_system_filename
        : null,
      formStatus,
      incompletePage,
    };
    return res.status(200).json({
      success: true,
      message: "Contractor details fetched successfully.",
      data: mergedData,
    });
  } catch (error) {
    console.error("Error fetching contractor details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const MakePdfToAllContractorForm = async (req, res) => {
  try {
    const { contractor_id, preview_html } = req.body;
    if (!contractor_id) {
      return res.status(400).json({ status: 400, message: "contractor_id is required" });
    }
    const contractorDetails = await ContractorRegistration.findOne({ where: { id: contractor_id } });
    if (!contractorDetails) {
      return res.status(404).json({ status: 404, message: "Contractor not found" });
    }

    const [insuranceDetails, publicLiability, safetyManagement, invitedOrganization, contractorInvitation] = await Promise.all([
      ContractorRegisterInsurance.findOne({ where: { contractor_id } }),
      ContractorPublicLiability.findOne({ where: { contractor_id } }),
      ContractorOrganizationSafetyManagement.findOne({ where: { contractor_id } }),
      Organization.findOne({ where: { id: contractorDetails.invited_organization_by } }),
      ContractorInvitation.findOne({ where: { id: contractorDetails.contractor_invitation_id } }),
    ]);

    const invitedUser = invitedOrganization?.user_id ? await User.findOne({ where: { id: invitedOrganization.user_id } }) : null;

    const responseData = {
      contractorDetails,
      insuranceDetails,
      publicLiability,
      safetyManagement,
      invitedOrganization,
      invitedUser,
      contractorInvitation,
    };

    console.log("Make Pdf Response", responseData);
    if (preview_html) {
      const html = await ejs.renderFile(path.join(__dirname, "..", "..", "views", "contractor_form_details.ejs"), responseData);
      return res.send(html);
    }
    const filePath = await generateContractorFormDetailsPdf(responseData, contractor_id);
    // return res.status(200).json({
    //   message:"All Data Retrieved Successfully",
    //   data:responseData
    // })
    return res.download(filePath);
  } catch (error) {
    console.error("Error generating contractor PDF:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const SearchLocation = async (req, res) => {
  try {
    const place = req.query.name;

    // Check if the 'name' query parameter is missing
    if (!place) {
      return res.status(400).json({ error: 'Missing "name" query parameter' });
    }

    const API_KEY = "AIzaSyB-EVjH_5VfSycKL4fJeLy1l-BsLWCyN6c";

    // Ensure API key is present
    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const encodedPlace = encodeURIComponent(place);

    // Construct the Google Maps API URL
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedPlace}&key=${API_KEY}`;

    https
      .get(url, apiRes => {
        let data = "";

        apiRes.on("data", chunk => {
          data += chunk;
        });

        apiRes.on("end", () => {
          try {
            // Parse the response from Google Maps API
            const result = JSON.parse(data);

            // Log the full response for debugging
            console.log("Google Maps API Response:", result);

            // Handle different status cases
            if (result.status === "OK" && result.results) {
              const results = result.results.map(loc => ({
                formatted: loc.formatted_address,
                geometry: loc.geometry,
                components: loc.address_components,
              }));
              return res.status(200).json({ results });
            } else if (result.status === "ZERO_RESULTS") {
              return res.status(404).json({ error: "No results found for the given query" });
            } else {
              // Handle other status codes like OVER_QUERY_LIMIT or REQUEST_DENIED
              return res.status(500).json({ error: `Google API error: ${result.status}` });
            }
          } catch (err) {
            console.error("Parse error:", err);
            return res.status(500).json({ error: "Failed to parse API response" });
          }
        });
      })
      .on("error", err => {
        console.error("API request error:", err);
        return res.status(500).json({ error: "API request failed", details: err.message });
      });
  } catch (error) {
    console.error("SearchLocation error:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};

const SendInductionEmail = async (req, res) => {
  try {
    const { contractor_id, UserEmail,inductionType } = req.body;
    const invited_by = req.user?.id;
    console.log("invited by", invited_by);
    if (!contractor_id) {
      return res.status(400).json({
        status: 400,
        message: "Contractor ID is required",
      });
    }
    const contractorDetails = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });

    if (!contractorDetails) {
      return res.status(404).json({
        status: 404,
        message: "Contractor not found.",
      });
    }
    const contractorInvitation = await ContractorInvitation.findOne({
      where: { id: contractorDetails.contractor_invitation_id },
    });

    if (!contractorInvitation) {
      return res.status(404).json({
        status: 404,
        message: "Contractor invitation not found.",
      });
    }
    await contractorInvitation.update({
      invitation_type: inductionType,
    });
    const email = contractorInvitation.contractor_email;
    const name = contractorInvitation.contractor_name;
    if (!email) {
      return res.status(400).json({
        status: 400,
        message: "No email found for this contractor.",
      });
    }

    const link = `${process.env.FRONTEND_URL}/induction-info/${contractorInvitation.invite_token}`;
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

    return res.status(200).json({
      status: 200,
      message: "Induction email has been queued successfully.",
    });
  } catch (error) {
    console.error("Error in SendInductionEmail:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
};

const RegitserContractiorInducation = async (req, res) => {
  try {
    const { verifyEmail } = req.body;

    const CheckEmail = await User.findOne({});
  } catch (error) {}
};

const ChangeEmailRequest =  async (req,res)=>{
  try {
    const {contractor_id,email_change} = req.body
    const findRegisterEmail = await ContractorRegistration.findOne({
      where:{
        contractor_invitation_id:contractor_id
      },attributes:['contractor_invitation_id','id']
    })
    const findcontractorRegister = await ContractorInvitation.findOne({
      where:{
        id:findRegisterEmail.contractor_invitation_id
      },attributes:['contractor_email','id']
    })
    const updateNewEmail = findcontractorRegister.update({
      
    })
  } catch (error) {
    
  }
}


module.exports = {
  CreateContractorRegistration,
  UploadInsuranceContrator,
  UploadPublicLiability,
  UploadSafetyMNContractor,
  GetInsuranceContractor,
  GetPublicLiabilityContractor,
  GetSafetyMangmentContractor,
  DeleteInsuranceContrator,
  DeletePublicLContrator,
  DeleteSafetyMContrator,
  CheckContractorRegisterStatus,
  DeleteContractorRecords,
  GetContractorDetails,
  MakePdfToAllContractorForm,
  SearchLocation,
  SendInductionEmail,
  RegitserContractiorInducation,
  ChangeEmailRequest,
  UploadContractorCompanyDocument
};
