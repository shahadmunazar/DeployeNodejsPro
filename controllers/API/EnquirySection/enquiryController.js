const { validationResult, body } = require("express-validator");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const { Op } = require("sequelize");

const Enquiry = require("../../../models/enquiry")(sequelize, DataTypes);
const ActivityLog = require("../../../models/activityLog")(sequelize, DataTypes);

// Validation Rules
const validateEnquiry = [
  // Enquiry Contact Info
  body("firstName").notEmpty().withMessage("First name is required"),

  body("lastName").notEmpty().withMessage("Last name is required"),

  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),

  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile number is required")
    //   .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Invalid phone number format"), // Valid phone number

  body("businessName").optional().isString().withMessage("Business name must be a string"),

  // Enquiry Core Info
  body("subject").notEmpty().withMessage("Enquiry subject is required"),
];

// Submit Enquiry
const SubmitEnquiry = async (req, res) => {
  await Promise.all(validateEnquiry.map(validation => validation.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, businessName, email, mobileNumber, subject } = req.body;

    const newEnquiry = await Enquiry.create({
      firstName,
      lastName,
      businessName,
      email,
      mobileNumber,
      subject,
    });

    // Send success response with created enquiry data
    return res.status(201).json({
      message: "Enquiry submitted successfully!",
      data: newEnquiry,
    });
  } catch (error) {
    // Catch any errors and respond with a 500 status
    console.error("Error submitting enquiry:", error);
    return res.status(500).json({
      message: "Something went wrong while submitting the enquiry.",
      error: error.message,
    });
  }
};

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

const GetAllEnquiry = async (req, res) => {
  try {
    const { status, submittedDate, userName, priority, search } = req.query;
    const whereConditions = {};
    if (status) {
      whereConditions.status = status;
    }
    if (userName) {
      whereConditions[Op.or] = [{ firstName: { [Op.like]: `%${userName}%` } }, { lastName: { [Op.like]: `%${userName}%` } }, { businessName: { [Op.like]: `%${userName}%` } }];
    }
    if (priority) {
      whereConditions.priority = priority;
    }
    if (search) {
      whereConditions[Op.or] = [
        { subject: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { businessName: { [Op.like]: `%${search}%` } },
      ];
    }
    let order = [["createdAt", "DESC"]];
    if (submittedDate === "oldest") {
      order = [["createdAt", "ASC"]];
    }
    const enquiries = await Enquiry.findAll({
      where: whereConditions,
      order: order,
    });
    const formattedEnquiries = enquiries.map(enquiry => {
      return {
        ...enquiry.toJSON(),
        createdAt: formatDate(enquiry.createdAt),
        updatedAt: formatDate(enquiry.updatedAt),
      };
    });
    return res.status(200).json({
      message: "Fetched all enquiries successfully.",
      data: formattedEnquiries,
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching enquiries.",
      error: error.message,
    });
  }
};

const GetEnquiryById = async (req, res) => {
  try {
    const enquiryId = req.params.id;
    const enquiry = await Enquiry.findOne({
      where: { id: enquiryId },
    });
    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }
    const activityLogs = await ActivityLog.findAll({
      where: { enquiryId: enquiryId },
      attributes: ["action", "subAdminName", "comments", "timestamp"],
      order: [["timestamp", "DESC"]],
    });
    const formatDate = date => {
      return new Date(date).toLocaleString("en-AU", {
        timeZone: "Australia/Sydney",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };
    const formattedCreatedAt = formatDate(enquiry.createdAt);
    const formattedUpdatedAt = formatDate(enquiry.updatedAt);
    const enquiryDetails = {
      enquiryId: enquiry.id,
      createdAt: formattedCreatedAt,
      updatedAt: formattedUpdatedAt,
      firstName: enquiry.firstName,
      lastName: enquiry.lastName,
      email: enquiry.email,
      mobileNumber: enquiry.mobileNumber,
      businessName: enquiry.businessName,
      subject: enquiry.subject,
      description: enquiry.description,
      status: enquiry.status,
      priority: enquiry.priority,
      assignedSubAdmin: enquiry.assignedSubAdmin || null,
      activityLogs: activityLogs || [],
    };
    return res.status(200).json({
      message: "Enquiry details fetched successfully.",
      data: enquiryDetails,
    });
  } catch (error) {
    console.error("Error fetching enquiry details:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching the enquiry details.",
      error: error.message,
    });
  }
};

const validateStatusUpdate = [
  body("status")
    .notEmpty()
    .withMessage("Status is required") // Ensure status is not empty
    .isIn(["New", "In Progress", "Resolved", "Closed"])
    .withMessage("Invalid status. Valid options are: New, In Progress, Resolved, Closed"),

  // Optional comments field - if provided, ensure it's a string and limit its length
  body("comments").optional().isString().withMessage("Comments must be a string.").isLength({ max: 1000 }).withMessage("Comments cannot be longer than 1000 characters."),
];

const UpdateInquiry = async (req, res) => {
  try {
    await Promise.all(validateStatusUpdate.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const enquiryId = req.params.id;
    const { status, comments, subAdminId, subAdminName } = req.body;
    const currentUser = req.user;
    console.log("Current User:", currentUser);
    if (!currentUser) {
      return res.status(401).json({
        message: "User not authorized to update the enquiry.",
      });
    }
    const enquiry = await Enquiry.findOne({
      where: { id: enquiryId },
    });
    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }
    if (enquiry.status === status) {
      return res.status(403).json({
        status: 403,
        message: "No status change detected.",
      });
    }
    const [updatedRowCount] = await Enquiry.update({ status }, { where: { id: enquiryId } });
    console.log("Update Result:", updatedRowCount);
    if (updatedRowCount === 0) {
      return res.status(400).json({
        message: "Failed to update enquiry status. No rows affected.",
      });
    }
    const updatedEnquiry = await Enquiry.findOne({
      where: { id: enquiryId },
    });
    const commentMessage = comments ? `Status changed to: ${status}. Comment: ${comments}` : `Status changed to: ${status}`;

    await ActivityLog.create({
      enquiryId,
      action: "Status Updated",
      subAdminId: currentUser.id,
      subAdminName: currentUser.name,
      comments: commentMessage,
      timestamp: new Date(),
    });

    // Fetch the activity logs for this enquiry
    const activityLogs = await ActivityLog.findAll({
      where: { enquiryId },
      order: [["timestamp", "DESC"]], // Sort by most recent activity
    });

    // Format dates for the updated enquiry and activity logs
    const formatDate = date => {
      return new Date(date).toLocaleString("en-AU", {
        timeZone: "Australia/Sydney",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formattedCreatedAt = formatDate(updatedEnquiry.createdAt);
    const formattedUpdatedAt = formatDate(updatedEnquiry.updatedAt);

    const enquiryDetails = {
      enquiryId: updatedEnquiry.id,
      createdAt: formattedCreatedAt,
      updatedAt: formattedUpdatedAt,
      firstName: updatedEnquiry.firstName,
      lastName: updatedEnquiry.lastName,
      email: updatedEnquiry.email,
      mobileNumber: updatedEnquiry.mobileNumber,
      businessName: updatedEnquiry.businessName,
      subject: updatedEnquiry.subject,
      description: updatedEnquiry.description,
      status: updatedEnquiry.status,
      priority: updatedEnquiry.priority,
      assignedSubAdmin: updatedEnquiry.assignedSubAdmin || null,
      activityLogs: activityLogs.map(log => ({
        action: log.action,
        subAdminName: log.subAdminName,
        comments: log.comments,
        timestamp: formatDate(log.timestamp),
      })),
    };

    // Return the updated enquiry details with activity logs
    return res.status(200).json({
      message: "Enquiry status updated successfully.",
      data: enquiryDetails,
    });
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    return res.status(500).json({
      message: "Something went wrong while updating the enquiry status.",
      error: error.message,
    });
  }
};

module.exports = { SubmitEnquiry, GetAllEnquiry, GetEnquiryById, UpdateInquiry };
