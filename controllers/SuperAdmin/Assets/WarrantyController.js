const { body, validationResult } = require("express-validator");
const sequelize = require("../../../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const WarrantyMaintenanceInsurance = require("../../../models/warrantymaintenanceinsurance")(sequelize, DataTypes);

// Custom function to validate DD/MM/YYYY date format
const isValidDateFormat = (date) => {
  // Regex to validate DD/MM/YYYY format
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/;
  return regex.test(date);
};

const CreateWarranty = async (req, res) => {
  try {
    // Using Promise.all for validation
    await Promise.all([
      body('amc_vendor')
        .notEmpty().withMessage('AMC Vendor is required')
        .run(req),
      body('warranty_vendor')
        .notEmpty().withMessage('Warranty Vendor is required')
        .run(req),
      body('amc_start_date')
        .custom(isValidDateFormat).withMessage('AMC Start Date must be in DD/MM/YYYY format')
        .run(req),
      body('amc_end_date')
        .custom(isValidDateFormat).withMessage('AMC End Date must be in DD/MM/YYYY format')
        .run(req),
      body('warranty_start_date')
        .custom(isValidDateFormat).withMessage('Warranty Start Date must be in DD/MM/YYYY format')
        .run(req),
      body('warranty_end_date')
        .custom(isValidDateFormat).withMessage('Warranty End Date must be in DD/MM/YYYY format')
        .run(req),
      body('insurance_start_date')
        .custom(isValidDateFormat).withMessage('Insurance Start Date must be in DD/MM/YYYY format')
        .run(req),
      body('insurance_end_date')
        .custom(isValidDateFormat).withMessage('Insurance End Date must be in DD/MM/YYYY format')
        .run(req)
    ]);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure the data from the request body
    const {
      amc_vendor,
      warranty_vendor,
      amc_start_date,
      amc_end_date,
      warranty_start_date,
      warranty_end_date,
      insurance_start_date,
      insurance_end_date
    } = req.body;

    // Convert dates from DD/MM/YYYY to YYYY-MM-DD before saving to DB
    const convertToISODate = (date) => {
      const [day, month, year] = date.split('/');
      return `${year}-${month}-${day}`;
    };

    const newWarranty = await WarrantyMaintenanceInsurance.create({
      amc_vendor,
      warranty_vendor,
      amc_start_date: convertToISODate(amc_start_date),
      amc_end_date: convertToISODate(amc_end_date),
      warranty_start_date: convertToISODate(warranty_start_date),
      warranty_end_date: convertToISODate(warranty_end_date),
      insurance_start_date: convertToISODate(insurance_start_date),
      insurance_end_date: convertToISODate(insurance_end_date)
    });

    // Send a success response
    res.status(201).json({
      message: "Warranty Maintenance Insurance record created successfully",
      data: newWarranty
    });
  } catch (error) {
    console.error("Error creating warranty:", error);
    res.status(500).json({ message: 'Error creating warranty' });
  }
};

const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

const GetAllCategoryListing = async (req, res) => {
    try {
      const getall = await WarrantyMaintenanceInsurance.findAll();
      const formattedData = getall.map((record) => ({
        ...record.toJSON(),
        amc_start_date: formatDate(record.amc_start_date),
        amc_end_date: formatDate(record.amc_end_date),
        warranty_start_date: formatDate(record.warranty_start_date),
        warranty_end_date: formatDate(record.warranty_end_date),
        insurance_start_date: formatDate(record.insurance_start_date),
        insurance_end_date: formatDate(record.insurance_end_date),
      }));
  
      return res.status(200).json({
        message: "All Warranty Maintenance Insurance records fetched successfully",
        data: formattedData,
      });
    } catch (error) {
      console.error("Error fetching warranty maintenance insurance records:", error);
      res.status(500).json({ message: 'Error fetching records' });
    }
  };
  

module.exports = {
  CreateWarranty,GetAllCategoryListing
};
