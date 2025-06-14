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
const ContractorRegistration = require("../../../models/ContractorRegistration");
function generateSecureOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
}

const RegitserContractiorInducation = async (req, res) => {
  try {
    const { userEmail, first_name, last_name, mobile_no, invite_by } = req.body;
    if (!userEmail) {
      return res.status(400).json({
        status: 400,
        message: "Email is required.",
      });
    }
    const findUserIsRegisterAlreadyorNot = await User.findOne({
      where: {
        email: userEmail,
      },
    });
    // if (findUserIsRegisterAlreadyorNot) {
    //   return res.status(400).json({success:true,status:400, alreadyRegistered: true, message: "User already registered." });
    // }
    const otp = generateSecureOTP();
    let existingRecord = await ContractorInductionRegistration.findOne({
      where: { email: userEmail },
    });
    if (existingRecord) {
      if (mobile_no) {
        await existingRecord.update({
          mobile_no,
          first_name,
          last_name,
          mobile_verified_expired_at: new Date(Date.now() + 10 * 60 * 1000),
          mobile_otp: otp,
        });
        await sendRegistrationOtpSms(mobile_no, otp);
        return res.status(200).json({
          status: 200,
          message: "Mobile OTP has been sent successfully.",
        });
      }
      await existingRecord.update({
        email_otp: otp,
        email_otp_expired_at: new Date(Date.now() + 10 * 60 * 1000),
      });
      await sendOtpEmail(userEmail, otp);
      return res.status(200).json({
        status: 200,
        message: "Email OTP has been sent successfully.",
      });
    }
    if (mobile_no) {
      const mobileExists = await ContractorInductionRegistration.findOne({
        where: { mobile_no },
      });
      if (mobileExists) {
        return res.status(400).json({
          status: 400,
          message: "Mobile number already registered.",
        });
      }
    }
    const newRecordData = {
      email: userEmail,
      email_otp: otp,
      invited_by_organization: invite_by,
      email_otp_expired_at: new Date(Date.now() + 10 * 60 * 1000),
    };
    if (mobile_no) {
      newRecordData.mobile_no = mobile_no;
      newRecordData.mobile_otp = otp;
      invited_by_organization: invite_by, (newRecordData.mobile_verified_expired_at = new Date(Date.now() + 10 * 60 * 1000));
    }
    await ContractorInductionRegistration.create(newRecordData);
    await sendOtpEmail(userEmail, otp);
    if (mobile_no) {
      await sendRegistrationOtpSms(mobile_no, otp);
    }
    return res.status(200).json({
      status: 200,
      message: `Contractor registered successfully. OTP sent to ${mobile_no ? "mobile and email" : "email only"}.`,
    });
  } catch (error) {
    console.error("Error in RegitserContractiorInducation:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const VerifyMobileAndEmail = async (req, res) => {
  try {
    const { mobile_no, userEmail, otpcode } = req.body;
    console.log("VerifyMobileAndEmail- Request Body:", req.body);
    if (!userEmail && !mobile_no) {
      return res.status(400).json({ status: 400, message: "Please provide either email or mobile number." });
    }
    if (!otpcode) {
      return res.status(400).json({ status: 400, message: "OTP is required." });
    }
    const record = await ContractorInductionRegistration.findOne({
      where: {
        [Op.or]: [userEmail ? { email: userEmail } : null, mobile_no ? { mobile_no } : null].filter(Boolean),
      },
    });
    if (!record) {
      return res.status(404).json({ status: 404, message: "User not found." });
    }
    const now = new Date();
    if (userEmail) {
      if (record.email_otp !== otpcode) {
        return res.status(400).json({ status: 400, message: "Invalid email OTP." });
      }
      if (record.email_otp_expired_at && now > record.email_otp_expired_at) {
        return res.status(400).json({ status: 400, message: "Email OTP has expired." });
      }
      record.email_verified_at = now;
      record.email_otp = null;
      record.email_otp_expired_at = null;
    } else if (mobile_no) {
      if (record.mobile_otp !== otpcode) {
        return res.status(400).json({ status: 400, message: "Invalid mobile OTP." });
      }
      if (record.mobile_verified_expired_at && now > record.mobile_verified_expired_at) {
        return res.status(400).json({ status: 400, message: "Mobile OTP has expired." });
      }
      record.mobile_otp_verified_at = now;
      record.mobile_otp = null;
      record.mobile_verified_expired_at = null;
    }
    await record.save();
    return res.status(200).json({
      status: 200,
      message: `${userEmail ? "Email" : "Mobile"} verified successfully.`,
      data: {
        id: record.id,
        email: record.email,
        mobile_no: record.mobile_no,
        first_name: record.first_name,
        last_name: record.last_name,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ status: 500, message: "Internal server error." });
  }
};

const ContractorRegistrationForm = async (req, res) => {
  try {
    const { VerificationId, first_name, last_name, organization_name, address, trade_Types, password, invited_by_organization, agree_terms } = req.body;
    console.log("req - body", req.body);
    if (!VerificationId) {
      return res.status(400).json({
        status: 400,
        message: "Verification ID is required.",
      });
    }
    const findDetails = await ContractorInductionRegistration.findOne({
      where: { id: VerificationId },
    });
    if (!findDetails) {
      return res.status(400).json({
        status: 400,
        message: "Contractor registration not found.",
      });
    }
    const message =
      !findDetails.email_verified_at && !findDetails.mobile_otp_verified_at
        ? "Please verify both Email and Mobile number before completing registration."
        : !findDetails.email_verified_at
        ? "Please verify your Email before completing registration."
        : !findDetails.mobile_otp_verified_at
        ? "Please verify your Mobile number before completing registration."
        : null;
    if (message) {
      return res.status(400).json({
        status: 400,
        message,
      });
    }
    // const hashedPassword = await bcrypt.hash(password, 10);
    const contractorImageFile = req.files?.contractor_image?.[0]?.originalname;
    console.log("contactor Regitser address", address);
    findDetails.first_name = first_name ?? findDetails.first_name;
    findDetails.last_name = last_name ?? findDetails.last_name;
    findDetails.organization_name = organization_name ?? findDetails.organization_name;
    findDetails.address = address ?? findDetails.address;
    findDetails.trade_type = Array.isArray(trade_Types) ? trade_Types : trade_Types ? [trade_Types] : findDetails.trade_type;
    findDetails.user_image = contractorImageFile ?? findDetails.user_image;
    // findDetails.password = hashedPassword;
    findDetails.invited_by_organization = invited_by_organization ?? findDetails.invited_by_organization;
    const token = crypto.randomBytes(64).toString("hex");
    const expiresAt = moment().add(72, "hours").toDate();
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      findDetails.password = hashedPassword;
    }
    // const addedIntoUser = await User.create({
    //   name: findDetails.first_name,
    //   email: findDetails.email,
    //   phone: findDetails.mobile_no,
    //   password: hashedPassword,
    //   invite_token: token,
    //   invite_expires_at: expiresAt,
    // });
    // const findroles = await Role.findOne({
    //   where: { name: "contractor" },
    //   attributes: ["id", "name"],
    // });
    // if (!findroles) {
    //   throw new Error('Role "contractor" not found');
    // }
    // await UserRole.create({
    //   userId: addedIntoUser.id,
    //   roleId: findroles.id,
    // });

    // console.log("find details", findDetails.invited_by_organization)

    let nameOrganization = null;
    if (invited_by_organization) {
      const findUser = await User.findOne({
        where: { id: invited_by_organization },
      });
      const findOrginazation = await organization.findOne({
        where: { user_id: findUser.id },
      });

      const tradename = await TradeType.findAll({
        where: {
          id: findDetails.trade_type,
        },
        attributes: ["name"],
      });
      console.log("data", findOrginazation);
      console.log("userDetauls", findUser);
      nameOrganization = findDetails.organization_name;
      console.log("nameorginazation", nameOrganization);
    }
    if (agree_terms) {
      findDetails.agree_terms = "submit";
    }
    await findDetails.save();
    return res.status(200).json({
      status: 200,
      message: "Contractor registration completed successfully.",
      data: {
        id: findDetails.id,
        first_name: findDetails.first_name,
        last_name: findDetails.last_name,
        email: findDetails.email,
        mobile_no: findDetails.mobile_no,
        organization_name: findDetails.organization_name,
        address: findDetails.address,
        trade_type: findDetails.trade_type,
        invited_by_organization: findDetails.invited_by_organization,
        user_image: findDetails.user_image,
      },
    });
  } catch (error) {
    console.error("Contractor Registration Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
    });
  }
};

const UploadContractorDocuments = async (req, res) => {
  try {
    console.log("Files received by multer:", req.files);
    console.log("Body received:", req.body);
    const { VerificationId, reference_number, issue_date, documentfileName, expiry_date, trade_type_id, confirmfinalSubmit, document_type } = req.body;
    if (!VerificationId) {
      return res.status(400).json({
        status: false,
        message: "VerificationId is required",
      });
    }
    const savedDocuments = await handleFileUploads(req.files, {
      VerificationId,
      trade_type_id,
      documentfileName,
      reference_number,
      issue_date,
      expiry_date,
    });
    if (confirmfinalSubmit === "true" && document_type) {
      const allDocs = await ContractorDocument.findAll({
        where: { contractor_reg_id: VerificationId },
      });
      const docIds = allDocs.map(doc => doc.id);
      for (const doc of allDocs) {
        if (doc.uploaded !== "uploaded") {
          await doc.update({ uploaded: "uploaded" });
        }
      }
      const updateFields = getRegistrationUpdateFields(document_type, docIds);
      await ContractorInductionRegistration.update(updateFields, {
        where: { id: VerificationId },
      });
      console.log(`Final submit updated for ${document_type}. Total documents confirmed: ${docIds.length}`);
    }
    return res.status(200).json({
      status: true,
      message: "Document uploaded successfully.",
      data: savedDocuments,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while uploading the document.",
      error: error.message,
    });
  }
};


async function handleFileUploads(files, { VerificationId, documentfileName,trade_type_id, reference_number, issue_date, expiry_date }) {
  const savedDocuments = [];
  for (const fieldName in files) {
    const fileArray = files[fieldName];
    if (!fileArray || !fileArray[0]) continue;
    const file = fileArray[0];
    const existingDoc = await ContractorDocument.findOne({
      where: {
        contractor_reg_id: VerificationId,
        document_type_id: trade_type_id,
      },
    });
    const documentData = {
      contractor_reg_id: VerificationId,
      document_type_id: trade_type_id,
      document_type: documentfileName,
      document_name: file.originalname,
      reference_number,
      issue_date,
      expiry_date,
      filename: file.filename,
      file_path: file.path,
      uploaded: "upload",
    };
    if (existingDoc) {
      await existingDoc.update(documentData);
      savedDocuments.push(existingDoc);
      console.log(`Updated existing document for trade_type_id ${trade_type_id}`);
    } else {
      const newDoc = await ContractorDocument.create(documentData);
      savedDocuments.push(newDoc);
      console.log(`Created new document for trade_type_id ${trade_type_id}`);
    }
  }
  return savedDocuments;
}

// Parse confirmfinalSubmit if needed (unused in final version but kept for future flexibility)
function parseConfirmIds(confirmfinalSubmit) {
  if (Array.isArray(confirmfinalSubmit)) {
    return confirmfinalSubmit.flatMap(item => item.split(",").map(id => id.trim()));
  } else if (typeof confirmfinalSubmit === "string") {
    return confirmfinalSubmit.split(",").map(id => id.trim());
  }
  return [];
}

// Prepare update fields for ContractorInductionRegistration
function getRegistrationUpdateFields(document_type, confirmIds) {
  const idArray = confirmIds.map(id => parseInt(id, 10));
  const updateFields = {};
  if (document_type === "mandatory") {
    updateFields.confirm_mandatoryDocumentUpload = JSON.stringify(idArray);
    updateFields.mandatoryDocumentUpload = "mandatory";
  } else if (document_type === "optional") {
    updateFields.confirm_optionalDocumentUpload = JSON.stringify(idArray);
    updateFields.optionalDocumentUpload = "optional";
  }

  return updateFields;
}

const GetUploadedDocuments = async (req, res) => {
  try {
    const { VerificationId, document_type_id, document_type } = req.query;
    if (!VerificationId) {
      return res.status(400).json({
        status: false,
        message: "VerificationId is required.",
      });
    }
    if (!document_type_id && !document_type) {
      return res.status(400).json({
        status: false,
        message: "Either document_type_id or document_type is required.",
      });
    }
    const whereCondition = { contractor_reg_id: VerificationId };
    if (document_type_id) {
      whereCondition.document_type_id = document_type_id;
    } else if (document_type) {
      whereCondition.uploadedDocumentsType = document_type;
    }
    const documents = await ContractorDocument.findAll({
      where: whereCondition,
    });
    if (!documents || documents.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No documents found.",
      });
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const result = documents.map(doc => ({
      ...doc.toJSON(),
      file_url: `${baseUrl}/${doc.file_path.replace(/^\/+/, "")}`,
    }));
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Documents retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while fetching documents.",
      error: error.message,
    });
  }
};

const getAllTraderTpeUploadedDocuments = async (req, res) => {
  try {
    const { VerificationId, document_type } = req.query;
    if (!VerificationId || !document_type) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "VerificationId and document_type are required.",
      });
    }
    const documents = await ContractorDocument.findAll({
      where: {
        uploaded: "uploaded",
        contractor_reg_id: VerificationId,
        document_type: document_type,
      },
    });
    return res.status(200).json({
      success: true,
      status: 200,
      message: "Documents fetched successfully.",
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "An error occurred while fetching documents.",
      error: error.message,
    });
  }
};

const AddedInductionContent = async (req, res) => {
  try {
    const { contractor_register_id, html_content } = req.body;
    if (!contractor_register_id || !html_content) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "Both contractor_register_id and html_content are required.",
      });
    }
    const addedInductionContent = await InductionContent.create({
      contractor_register_id,
      html_content,
    });
    return res.status(200).json({
      success: true,
      status: 200,
      data: addedInductionContent,
      message: "Induction content added successfully.",
    });
  } catch (error) {
    console.error("Error adding induction content:", error.message);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

const GetInductionContent = async (req, res) => {
  try {
    const { contractor_register_id } = req.query;
    if (!contractor_register_id) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "contractor_register_id is required",
      });
    }
    const getContent = await InductionContent.findAll({
      where: { contractor_register_id },
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      status: 200,
      data: getContent,
      message: "Fetched induction content successfully",
    });
  } catch (error) {
    console.error("Error in GetInductionContent:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const UploadContentInduction = async (req, res) => {
  try {
    const { organizations_id, pdf_name } = req.body;

    if (!req.files || !req.files.contractor_induction_pdf) {
      return res.status(400).json({ success: false, message: "PDF file is required" });
    }

    const file = req.files.contractor_induction_pdf[0];

    const pdf_file = file.filename;
    const pdf_url = `${req.protocol}://${req.get("host")}/uploads/contractorRegistratioDocuments/contractor_induction_pdf/${pdf_file}`;

    const addedPdf = await ContractorInductionPdf.create({
      organizations_id,
      pdf_name,
      pdf_file,
      pdf_url,
    });

    return res.status(200).json({
      success: true,
      message: "Induction PDF uploaded successfully",
      data: addedPdf,
    });
  } catch (error) {
    console.error("Error uploading induction content:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading induction PDF",
    });
  }
};

const GetInductionContractorPdf = async (req, res) => {
  try {
    const { contractor_register_id } = req.query;
    if (!contractor_register_id) {
      return res.status(400).json({
        success: false,
        message: "contractor_register_id is required",
      });
    }
    const findPdf = await ContractorInductionPdf.findAll({
      where: {
        organizations_id: contractor_register_id,
      },
    });
    return res.status(200).json({
      success: true,
      status: 200,
      data: findPdf,
      message: "Fetched induction PDFs for the contractor successfully",
    });
  } catch (error) {
    console.error("Error fetching induction PDFs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching induction PDFs",
    });
  }
};

const GetAllInductionRegister = async (req, res) => {
  try {
    const user_org_id = req.user?.id;
    const findAllInductionRegister = await ContractorRegistration.findAll({
      where: {
        invited_by: user_org_id,
      },
      raw: true,
    });
    if (!findAllInductionRegister.length) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "No induction contractor found for this organization",
      });
    }

    const findOutContractorRegistration = await ContractorInductionRegistration.findAll({
      where:findAllInductionRegister.id
    })
    const registrationIds = findOutContractorRegistration.map(item => item.id);
    const allDocuments = await ContractorDocument.findAll({
      where: {
        contractor_reg_id: registrationIds,
      },
      raw: true,
    });
    const allTradeTypes = await TradeType.findAll({
      attributes: ["id", "name"],
      raw: true,
    });
    const BASE_URL = `${req.protocol}://${req.get("host")}/`;
    const enrichedRegistrations = findAllInductionRegister.map(reg => {
      let tradeTypeIds = [];
      try {
        const parsed = JSON.parse(reg.trade_type);
        if (Array.isArray(parsed) && parsed.length) {
          tradeTypeIds = parsed[0].split(",").map(id => Number(id.trim()));
        }
      } catch (err) {
        console.error(`Failed to parse trade_type for registration ID ${reg.id}:`, err);
      }
      const tradeTypes = allTradeTypes.filter(type => tradeTypeIds.includes(type.id));
      const documents = allDocuments
        .filter(doc => doc.contractor_reg_id === reg.id)
        .map(doc => ({
          ...doc,
          file_url: `${BASE_URL}${doc.file_path.replace(/\\/g, "/")}`,
        }));

      return {
        ...reg,
        tradeTypes,
        documents,
      };
    });
    return res.status(200).json({
      success: true,
      status: 200,
      data: enrichedRegistrations,
      message: "All data retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching induction registrations:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal server error",
    });
  }
};


const GetInvitationorgId = async (req, res) => {
  try {
    const { invite_token } = req.query;

    if (!invite_token) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "invite_token is required",
      });
    }

    const getDetails = await contractorInvitation.findOne({
      where: { invite_token },
      attributes: ["id", "invited_by", "invite_token", "status"], // include 'status' if needed
    });

    if (!getDetails) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "No invitation found for the provided token",
      });
    }

    // Update status to 'accepted'
    await contractorInvitation.update({ status: "accepted" }, { where: { id: getDetails.id } });

    return res.status(200).json({
      status: 200,
      success: true,
      data: { ...getDetails.toJSON(), status: "accepted" },
      message: "Invitation accepted and details retrieved successfully",
    });
  } catch (error) {
    console.error("Error in GetInvitationorgId:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
    });
  }
};

const FetchPrequalification = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { name } = req.query;

    const whereCondition = {
      invited_by_organization: user_id,
    };

    if (name) {
      whereCondition.organization_name = {
        [Op.like]: `%${name}%`,
      };
    }

    const contractorInductions = await ContractorInductionRegistration.findAll({
      where: whereCondition,
      attributes: [
        "email",
        "organization_name",
        "id",
        "invited_by_organization",
        "first_name",
        "last_name",
      ],
      raw: true,
    });

    const orgIds = contractorInductions.map(item => item.invited_by_organization);
    console.log("orgIds",orgIds)
    const contractorInvitations = await contractorInvitation.findAll({
      where: {
        invited_by: orgIds,
      },
      attributes: ["contractor_email", "id", "invited_by"],
      raw: true,
    });

    // Map invitations by email for easier lookup
    const invitationMap = contractorInvitations.reduce((acc, invite) => {
      if (!acc[invite.contractor_email]) {
        acc[invite.contractor_email] = [];
      }
      acc[invite.contractor_email].push(invite);
      return acc;
    }, {});

    // Merge invitations into inductions
    const mergedInductions = contractorInductions.map(induction => {
      const relatedInvites = invitationMap[induction.email] || [];
      return {
        ...induction,
        contractorInvitations: relatedInvites,
        totalInvitationsFound: relatedInvites.length,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        contractorInductions: mergedInductions,
      },
      message: "Retrieved invitation records successfully.",
      status: 200,
    });

  } catch (error) {
    console.error("Error fetching invitations:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching invitations.",
      error: error.message,
      status: 500,
    });
  }
};



module.exports = {
  RegitserContractiorInducation,
  VerifyMobileAndEmail,
  ContractorRegistrationForm,
  UploadContractorDocuments,
  getAllTraderTpeUploadedDocuments,
  GetUploadedDocuments,
  AddedInductionContent,
  GetInductionContent,
  UploadContentInduction,
  GetInductionContractorPdf,
  GetAllInductionRegister,
  GetInvitationorgId,
  FetchPrequalification
};
