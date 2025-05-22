const { DataTypes, Op, Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

const sequelize = require("../../../config/database");
const crypto = require("crypto");
const ContractorInductionRegistration = require("../../../models/ContractorInductionRegistration")(sequelize, DataTypes);
const { sendOtpEmail } = require("../../../helpers/sendOtpEmail");
const { sendRegistrationOtpSms } = require("../../../helpers/smsHelper");

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
    const { userEmail, first_name, last_name, mobile_no, organization_name, address, trade_type } = req.body;
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
    if (existingRecord) {
      await existingRecord.update({
        mobile_no,
        first_name,
        last_name,
        mobile_verified_expired_at: new Date(Date.now() + 10 * 60 * 1000),
        mobile_otp: otp,
      });
      const mobile = existingRecord.mobile_no;
      await sendRegistrationOtpSms(mobile, otp);
      return res.status(200).json({
        status: 200,
        message: "Mobile OTP has been sent successfully.",
      });
    } else {
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
      const newRecord = await ContractorInductionRegistration.create({
        email: userEmail,
        email_otp: otp,
        email_otp_expired_at: new Date(Date.now() + 10 * 60 * 1000),
      });
      await sendOtpEmail(userEmail, otp);
      return res.status(200).json({
        status: 200,
        message: "Contractor registered successfully. OTP sent to email.",
      });
    }
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
    const { mobile_no, userEmail, email_otp, mobile_no_otp } = req.body;
    if (!userEmail && !mobile_no) {
      return res.status(400).json({ status: 400, message: "Please provide email or mobile number." });
    }
    if (!email_otp && !mobile_no_otp) {
      return res.status(400).json({ status: 400, message: "Please provide an OTP to verify." });
    }
    if (email_otp && mobile_no_otp) {
      return res.status(400).json({ status: 400, message: "Please verify only one OTP at a time (email or mobile)." });
    }
    const record = await ContractorInductionRegistration.findOne({
      where: {
        [Op.or]: [userEmail ? { email: userEmail } : null, mobile_no ? { mobile_no } : null].filter(Boolean),
      },
    });
    if (!record) {
      return res.status(404).json({ status: 404, message: "User not found." });
    }
    const currentTime = new Date();
    if (email_otp) {
      if (record.email_verified_at) {
        return res.status(400).json({ status: 400, message: "Email already verified." });
      }
      if (!record.email_otp || record.email_otp !== email_otp) {
        return res.status(400).json({ status: 400, message: "Invalid email OTP." });
      }
      if (record.email_otp_expired_at && currentTime > record.email_otp_expired_at) {
        return res.status(400).json({ status: 400, message: "Email OTP has expired." });
      }
      record.email_verified_at = currentTime;
      record.email_otp_expired_at = null;
      record.email_otp = null;
      await record.save();
      return res.status(200).json({
        status: 200,
        message: "Email verified successfully.",
        data: {
          userEmail: record.email,
        },
      });
    }
    if (mobile_no_otp) {
      if (record.mobile_otp_verified_at) {
        return res.status(400).json({ status: 400, message: "Mobile already verified." });
      }
      if (!record.mobile_otp || record.mobile_otp !== mobile_no_otp) {
        return res.status(400).json({ status: 400, message: "Invalid mobile OTP." });
      }
      if (record.mobile_verified_expired_at && currentTime > record.mobile_verified_expired_at) {
        return res.status(400).json({ status: 400, message: "Mobile OTP has expired." });
      }
      record.mobile_otp_verified_at = currentTime;
      record.mobile_verified_expired_at = null;
      record.mobile_otp = null;
      await record.save();
      return res.status(200).json({
        status: 200,
        message: "Mobile number verified successfully.",
        data: {
          VerificationId: record.id,
          first_name: record.first_name,
          last_name: record.last_name,
          email: record.email,
        },
      });
    }
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};

const ContractorRegistrationForm = async (req, res) => {
  try {
    const {
      VerificationId,
      first_name,
      last_name,
      organization_name,
      address,
      trade_Types,
      password,
      invited_by_organization
    } = req.body;

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
    const contractorImageFile = req.files?.contractor_image?.[0]?.filename;
    findDetails.first_name = first_name || findDetails.first_name;
    findDetails.last_name = last_name || findDetails.last_name;
    findDetails.organization_name = organization_name || findDetails.organization_name;
    findDetails.address = address || findDetails.address;
    findDetails.trade_type = trade_Types || findDetails.trade_Types;
    findDetails.user_image = contractorImageFile || findDetails.userImage;
    findDetails.password = hashedPassword;
    findDetails.invited_by_organization = invited_by_organization;
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
        trade_type: findDetails.trade_type,
        invited_by_organization: findDetails.invited_by_organization,
        userImage: findDetails.user_image,
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


module.exports = { RegitserContractiorInducation, VerifyMobileAndEmail, ContractorRegistrationForm };
