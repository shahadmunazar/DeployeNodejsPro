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
require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
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
const { response } = require("express");

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
  body("street").optional().isString(),
  body("suburb").optional().isString(),
  body("state").optional().isString(),
  body("contractor_phone_number")
    .optional()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Invalid phone number format"),
  body("service_to_be_provided").optional().isString(),
  body("covered_amount").optional().isInt(),
  body("have_professional_indemnity_insurance").optional().isBoolean(),
  body("is_staff_member_nominated").optional().isIn(["Yes", "No"]),
  body("provide_name_position_mobile_no").optional().isObject(),
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

    const { id, contractor_invitation_id, abn_number } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Contractor registration ID is required.",
      });
    }
    if (contractor_invitation_id) {
      const invitationExists = await ContractorInvitation.findOne({
        where: { id: contractor_invitation_id },
      });

      if (!invitationExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid contractor_invitation_id: no matching record found.",
        });
      }
    }
    const existing = await ContractorRegistration.findOne({ where: { id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Contractor registration not found.",
      });
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

    if (abn_number) {
      const abnExists = await ContractorRegistration.findOne({
        where: {
          abn_number,
          id: { [Op.ne]: id },
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
    const fieldsToUpdate = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    await existing.update(fieldsToUpdate);

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Contractor registration updated successfully",
      data: existing,
    });
  } catch (error) {
    console.error("Error in ContractorRegistration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const UploadInsuranceContrator = async (req, res) => {
    try {
      const { contractor_id, end_date } = req.body;
  
      if (!contractor_id || !end_date) {
        return res.status(400).json({ message: "Contractor ID and insurance end date are required." });
      }
      const file = req.files?.contractor_insurance?.[0];
      const document_url = file ? file.path.replace(/\\/g, "/") : null;
      if (!document_url) {
        return res.status(400).json({ message: "Insurance document file is required." });
      }
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
          document_url,
        });
      } else {
        insuranceRecord = await ContractorRegisterInsurance.create({
          contractor_id,
          end_date,
          document_url,
        });
      }
      await contractor.update({
        employee_insure_doc_id: insuranceRecord.id,
      });
      return res.status(200).json({
        success: true,
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
    const { contractor_id, end_date } = req.body;
    if (!end_date) {
      return res.status(400).json({ message: "All Public fields are required." });
    }
    const file = req.files?.contractor_liability?.[0];
    const public_liabilty_file_url = file ? file.path.replace(/\\/g, "/") : null;
    const newInsurance = await ContractorPublicLiability.create({
      contractor_id,
      end_date,
      public_liabilty_file_url,
    });
    const contractor = await ContractorRegistration.findOne({
      where: { id: contractor_id },
    });
    if (!contractor) {
      return res.status(404).json({ message: "Contractor not found." });
    }
    await contractor.update({
      public_liability_doc_id: newInsurance.id,
    });
    return res.status(200).json({
      status: 200,
      message: "Contractor insurance uploaded and updated successfully.",
      data: newInsurance,
    });
  } catch (err) {
    console.error("UploadInsuranceContrator error:", err);
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
      const does_organization_safety_management_system_filename = file
        ? file.path.replace(/\\/g, "/")
        : null;
  
      if (!does_organization_safety_management_system_filename) {
        return res.status(400).json({
          success: false,
          message: "Safety management document file is required.",
        });
      }
  
      const contractor = await ContractorRegistration.findOne({
        where: { id: contractor_id },
      });
  
      if (!contractor) {
        return res.status(404).json({
          success: false,
          message: "Contractor not found.",
        });
      }
  
      // Check if a record already exists for the contractor
      let safetyRecord = await ContractorOrganizationSafetyManagement.findOne({
        where: { contractor_id },
      });
  
      if (safetyRecord) {
        // Update existing record
        await safetyRecord.update({
          does_organization_safety_management_system_filename,
        });
      } else {
        // Create new record
        safetyRecord = await ContractorOrganizationSafetyManagement.create({
          contractor_id,
          does_organization_safety_management_system_filename,
        });
      }
  
      await contractor.update({
        organization_safety_management_id: safetyRecord.id,
      });
  
      return res.status(200).json({
        success: true,
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
          status:400,
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
            status:400,
            message: "Invalid type. Valid types are: insurance, public, safety.",
          });
      }
  
      const record = await model.findOne({ where: { contractor_id } });
  
      if (!record) {
        return res.status(404).json({ status:404,success: false, message: notFoundMessage });
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
        console.log("ins",insuranceRecord);
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
  

const DeletePublicLContrator = async(req,res)=>{
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
        console.log("CheckData",insuranceRecord);
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
}

const DeleteSafetyMContrator = async(req,res)=>{
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
        console.log("CheckData",insuranceRecord);
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
  DeleteSafetyMContrator
};
