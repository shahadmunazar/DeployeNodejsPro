const { DataTypes, Op, Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

const sequelize = require("../../../config/database");
const crypto = require("crypto");
const ContractorInductionRegistration = require("../../../models/ContractorInductionRegistration")(sequelize, DataTypes);
const ContractorDocument = require("../../../models/contractor_document")(sequelize, DataTypes);
const { sendOtpEmail } = require("../../../helpers/sendOtpEmail");
const { sendRegistrationOtpSms } = require("../../../helpers/smsHelper");
const TradeTypeSelectDocument = require("../../../models/TradeTypeSelectDocument")(sequelize, DataTypes);
const TradeType = require("../../../models/trade_type")(sequelize, DataTypes);
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
    const { userEmail, first_name, last_name, mobile_no } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        status: 400,
        message: "Email is required.",
      });
    }

    const otp = generateSecureOTP();
    let existingRecord = await ContractorInductionRegistration.findOne({
      where: { email: userEmail },
    });

    // If record exists
    if (existingRecord) {
      if (mobile_no) {
        // Update record with mobile info and send mobile OTP
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

      // If mobile number is not sent, just send email OTP again (optional)
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

    // If record doesn't exist
    // Check for duplicate mobile (if provided)
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

    // Create new record
    const newRecordData = {
      email: userEmail,
      email_otp: otp,
      email_otp_expired_at: new Date(Date.now() + 10 * 60 * 1000),
    };

    if (mobile_no) {
      newRecordData.mobile_no = mobile_no;
      newRecordData.mobile_otp = otp;
      newRecordData.mobile_verified_expired_at = new Date(Date.now() + 10 * 60 * 1000);
    }

    await ContractorInductionRegistration.create(newRecordData);

    // Send appropriate OTPs
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
      // if (record.email_verified_at) {
      //   return res.status(400).json({ status: 400, message: "Email is already verified." });
      // }

      if (record.email_otp !== otpcode) {
        return res.status(400).json({ status: 400, message: "Invalid email OTP." });
      }
      if (record.email_otp_expired_at && now > record.email_otp_expired_at) {
        return res.status(400).json({ status: 400, message: "Email OTP has expired." });
      }
      //new
      record.email_verified_at = now;
      record.email_otp = null;
      record.email_otp_expired_at = null;
    } else if (mobile_no) {
      // if (record.mobile_otp_verified_at) {
      //   return res.status(400).json({ status: 400, message: "Mobile is already verified." });
      // }

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
    const { VerificationId, first_name, last_name, organization_name, address, trade_Types, password, invited_by_organization } = req.body;
    console.log("req - body", req.body);
    if (!VerificationId || !password) {
      return res.status(400).json({
        status: 400,
        message: "Verification ID and password are required.",
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const contractorImageFile = req.files?.contractor_image?.[0]?.originalname;
    console.log("contactor Regitser address", address);
    findDetails.first_name = first_name ?? findDetails.first_name;
    findDetails.last_name = last_name ?? findDetails.last_name;
    findDetails.organization_name = organization_name ?? findDetails.organization_name;
    findDetails.address = address ?? null;
    findDetails.trade_type = Array.isArray(trade_Types) ? trade_Types : trade_Types ? [trade_Types] : findDetails.trade_type;
    findDetails.user_image = contractorImageFile ?? findDetails.user_image;
    findDetails.password = hashedPassword;
    findDetails.invited_by_organization = invited_by_organization ?? findDetails.invited_by_organization;
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
    const { VerificationId, reference_number, issue_date, expiry_date } = req.body;
    if (!VerificationId || !reference_number) {
      return res.status(400).json({
        status: false,
        message: "VerificationId and reference_number are required.",
      });
    }
    const registration = await ContractorInductionRegistration.findOne({
          where: { id: trade_type_id },
          attributes: ['trade_type']
        });
    
        if (!registration || !registration.trade_type) {
          return res.status(404).json({
            success: false,
            status: 404,
            message: 'No trade_type found for the given contractor registration ID'
          });
        }
    
        // Convert "72,73,74,75,76" => [72, 73, 74, 75, 76]
        const tradeTypeIds = registration.trade_type
          .split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id));
    
        if (tradeTypeIds.length === 0) {
          return res.status(400).json({
            success: false,
            status: 400,
            message: 'No valid trade type IDs found'
          });
        }
        const allDocuments = await TradeTypeSelectDocument.findAll({
          where: {
            trade_type_id: {
              [Op.in]: tradeTypeIds
            }
          },
          attributes: ['id', 'trade_type_id', 'document_type', 'document_types_opt_man']
        });
    
        // Deduplicate by document_type, prefer 'mandatory'
        const documentMap = {};
        for (const doc of allDocuments) {
          const key = doc.document_type;
          const existing = documentMap[key];
          if (!existing || (existing.document_types_opt_man === 'optional' && doc.document_types_opt_man === 'mandatory')) {
            documentMap[key] = doc;
          }
        }
    
        // Group into mandatory and optional
        const result = { mandatory: [], optional: [] };
        Object.values(documentMap).forEach(doc => {
          result[doc.document_types_opt_man === 'mandatory' ? 'mandatory' : 'optional'].push(doc);
        });

    // Map for updating reference IDs in ContractorInductionRegistration
    const idFieldMap = {
      covid: "covid_id",
      flu_vaccination: "flu_vaccination_id",
      health_practitioner_registration: "health_practitioner_registration_id",
      police_check: "police_check_id",
      trade_qualification: "trade_qualification_id",
    };

    const uploadedDocs = {};

    for (const docEntry of tradeTypeDocs) {
      const fieldKey = Object.keys(req.files || {}).find(key =>
        key.toLowerCase().includes(docEntry.document_type.toLowerCase().replace(/\s+/g, "_"))
      );

      if (fieldKey && req.files[fieldKey]?.[0]) {
        const file = req.files[fieldKey][0];
        const filename = file.originalname;
        const document_type = docEntry.document_type.toLowerCase().replace(/\s+/g, "_");

        let document = await ContractorDocument.findOne({
          where: {
            contractor_reg_id: VerificationId,
            document_type,
          },
        });

        if (document) {
          await document.update({
            reference_number,
            issue_date,
            expiry_date,
            filename,
          });
        } else {
          document = await ContractorDocument.create({
            contractor_reg_id: VerificationId,
            document_type,
            reference_number,
            issue_date,
            expiry_date,
            filename,
          });
        }

        uploadedDocs[document_type] = document;
      }
    }

    if (Object.keys(uploadedDocs).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid documents uploaded.",
      });
    }

    // Prepare update object
    const updateFields = {};
    for (const [docType, doc] of Object.entries(uploadedDocs)) {
      const column = idFieldMap[docType];
      if (column) {
        updateFields[column] = doc.id;
      }
    }

    if (Object.keys(updateFields).length > 0) {
      await ContractorInductionRegistration.update(updateFields, {
        where: { id: VerificationId },
      });
    }

    return res.status(201).json({
      status: true,
      message: "Documents uploaded/updated successfully.",
      data: uploadedDocs,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      status: false,
      message: "An error occurred while uploading the documents.",
      error: error.message,
    });
  }
};


module.exports = { RegitserContractiorInducation, VerifyMobileAndEmail, ContractorRegistrationForm, UploadContractorDocuments };
