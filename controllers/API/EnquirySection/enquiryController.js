const { validationResult, body } = require('express-validator');
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const { Op } = require('sequelize');

const Enquiry  = require('../../../models/enquiry')(sequelize, DataTypes);
const ActivityLog = require("../../../models/activityLog")(sequelize,DataTypes);

// Validation Rules
const validateEnquiry = [
    // Enquiry Contact Info
    body('firstName')
      .notEmpty()
      .withMessage('First name is required'),
  
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required'),
  
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
  
    body('mobileNumber')
      .notEmpty()
      .withMessage('Mobile number is required')
    //   .matches(/^[0-9+\-\s()]{7,20}$/)
      .withMessage('Invalid phone number format'), // Valid phone number
  
    body('businessName')
      .optional()
      .isString()
      .withMessage('Business name must be a string'),
  
    // Enquiry Core Info
    body('subject')
      .notEmpty()
      .withMessage('Enquiry subject is required'),
];

// Submit Enquiry
const SubmitEnquiry = async (req, res) => {
  
  // Run all validations
  await Promise.all(validateEnquiry.map(validation => validation.run(req)));
  
  // Check if there are validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Proceed to create enquiry if validation passes
  try {
    const {
      firstName,
      lastName,
      businessName,
      email,
      mobileNumber,
      subject
    } = req.body;

    // Create a new Enquiry record in the database
    const newEnquiry = await Enquiry.create({
      firstName,
      lastName,
      businessName,
      email,
      mobileNumber,
      subject
    });

    // Send success response with created enquiry data
    return res.status(201).json({
      message: 'Enquiry submitted successfully!',
      data: newEnquiry
    });
  } catch (error) {
    // Catch any errors and respond with a 500 status
    console.error('Error submitting enquiry:', error);
    return res.status(500).json({
      message: 'Something went wrong while submitting the enquiry.',
      error: error.message
    });
  }
};


const formatDate = (date) => {
    const formattedDate = new Date(date);
    const day = String(formattedDate.getDate()).padStart(2, '0');
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const year = formattedDate.getFullYear();
    let hours = formattedDate.getHours();
    const minutes = String(formattedDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };
  
  
  const GetAllEnquiry = async (req, res) => {
    try {
      const {
        status,        
        submittedDate,  
        userName,       
        priority,       
        search,        
      } = req.query;
      const whereConditions = {};
      if (status) {
        whereConditions.status = status;
      }
      if (userName) {
        whereConditions[Op.or] = [
          { firstName: { [Op.like]: `%${userName}%` } },
          { lastName: { [Op.like]: `%${userName}%` } },
          { businessName: { [Op.like]: `%${userName}%` } }
        ];
      }
      if (priority) {
        whereConditions.priority = priority;
      }
      if (search) {
        whereConditions[Op.or] = [
          { subject: { [Op.like]: `%${search}%` } },
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { businessName: { [Op.like]: `%${search}%` } }
        ];
      }
      let order = [['createdAt', 'DESC']];
      if (submittedDate === 'oldest') {
        order = [['createdAt', 'ASC']];
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
        message: 'Fetched all enquiries successfully.',
        data: formattedEnquiries
      });
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      return res.status(500).json({
        message: 'Something went wrong while fetching enquiries.',
        error: error.message
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
          message: 'Enquiry not found',
        });
      }
      const activityLogs = await ActivityLog.findAll({
        where: { enquiryId: enquiryId },
        attributes: ['action', 'subAdminName', 'comments', 'timestamp'],
        order: [['timestamp', 'DESC']],
      });
      const formatDate = (date) => {
        return new Date(date).toLocaleString('en-AU', {
          timeZone: 'Australia/Sydney',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
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
        message: 'Enquiry details fetched successfully.',
        data: enquiryDetails,
      });
  
    } catch (error) {
      console.error('Error fetching enquiry details:', error);
      return res.status(500).json({
        message: 'Something went wrong while fetching the enquiry details.',
        error: error.message,
      });
    }
  };



module.exports = { SubmitEnquiry,GetAllEnquiry ,GetEnquiryById};
