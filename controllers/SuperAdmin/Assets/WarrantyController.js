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
        .run(req),
        body('status')
        .withMessage('Status Will be True or False')
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
      insurance_end_date,
      status
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
      insurance_end_date: convertToISODate(insurance_end_date),
      status
    });

    // Send a success response
    res.status(200).json({
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
    const month = String(d.getMonth() + 1).padStart(2, '0');
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
  
  const GetWarrantyById = async (req, res) => {
    const { id } = req.params;  // Extract the id from the request parameters
    try {
      // Fetch the warranty using findByPk
      const warranty = await WarrantyMaintenanceInsurance.findByPk(id);
  
      // If no warranty is found, return a 404 error with a meaningful message
      if (!warranty) {
        return res.status(404).json({ message: "Warranty not found" });
      }
  
      // Helper function to format date in 'DD-MM-YYYY' format
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };
  
      // Format date fields
      const formattedWarranty = {
        ...warranty.toJSON(),
        amc_start_date: formatDate(warranty.amc_start_date),
        amc_end_date: formatDate(warranty.amc_end_date),
        warranty_start_date: formatDate(warranty.warranty_start_date),
        warranty_end_date: formatDate(warranty.warranty_end_date),
        insurance_start_date: formatDate(warranty.insurance_start_date),
        insurance_end_date: formatDate(warranty.insurance_end_date),
      };
  
      // Return the warranty details with formatted dates
      return res.status(200).json({
        message: "Warranty Maintenance Insurance record fetched successfully",
        data: formattedWarranty
      });
  
    } catch (error) {
      console.error("Error fetching warranty:", error);
      return res.status(500).json({
        message: "Error fetching warranty record",
        error: error.message,
      });
    }
  };

  const UpdateWarranty = async (req, res) => {
    try {
      const { id } = req.params;  // Extract id from route params
      
      // Validation for specific fields
      await Promise.all([
        body('amc_vendor')
          .optional()
          .notEmpty().withMessage('AMC Vendor is required if provided')
          .run(req),
        body('warranty_vendor')
          .optional()
          .notEmpty().withMessage('Warranty Vendor is required if provided')
          .run(req),
        body('amc_start_date')
          .optional()
          .custom(isValidDateFormat).withMessage('AMC Start Date must be in DD/MM/YYYY format')
          .run(req),
        body('amc_end_date')
          .optional()
          .custom(isValidDateFormat).withMessage('AMC End Date must be in DD/MM/YYYY format')
          .run(req),
        body('warranty_start_date')
          .optional()
          .custom(isValidDateFormat).withMessage('Warranty Start Date must be in DD/MM/YYYY format')
          .run(req),
        body('warranty_end_date')
          .optional()
          .custom(isValidDateFormat).withMessage('Warranty End Date must be in DD/MM/YYYY format')
          .run(req),
        body('insurance_start_date')
          .optional()
          .custom(isValidDateFormat).withMessage('Insurance Start Date must be in DD/MM/YYYY format')
          .run(req),
        body('insurance_end_date')
          .optional()
          .custom(isValidDateFormat).withMessage('Insurance End Date must be in DD/MM/YYYY format')
          .run(req),
        body('status')
        .withMessage('Status Will be True or False')
        .run(req)
      ]);
  
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // Find the existing warranty record by ID
      const warrantyRecord = await WarrantyMaintenanceInsurance.findOne({ where: { id } });
  
      if (!warrantyRecord) {
        return res.status(404).json({ message: 'Warranty record not found' });
      }
  
      // Extract data from the request body
      const {
        amc_vendor,
        warranty_vendor,
        amc_start_date,
        amc_end_date,
        warranty_start_date,
        warranty_end_date,
        insurance_start_date,
        insurance_end_date,status
      } = req.body;
  
      // Convert dates from DD/MM/YYYY to YYYY-MM-DD before saving to DB
      const convertToISODate = (date) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
      };
  
      // Update only the provided fields
      if (amc_vendor) warrantyRecord.amc_vendor = amc_vendor;
      if (warranty_vendor) warrantyRecord.warranty_vendor = warranty_vendor;
      if (status) warrantyRecord.status = status;
      if (amc_start_date) warrantyRecord.amc_start_date = convertToISODate(amc_start_date);
      if (amc_end_date) warrantyRecord.amc_end_date = convertToISODate(amc_end_date);
      if (warranty_start_date) warrantyRecord.warranty_start_date = convertToISODate(warranty_start_date);
      if (warranty_end_date) warrantyRecord.warranty_end_date = convertToISODate(warranty_end_date);
      if (insurance_start_date) warrantyRecord.insurance_start_date = convertToISODate(insurance_start_date);
      if (insurance_end_date) warrantyRecord.insurance_end_date = convertToISODate(insurance_end_date);
  
      // Save the updated record to the database
      await warrantyRecord.save();
  
      // Send a success response
      res.status(200).json({
        message: 'Warranty Maintenance Insurance record updated successfully',
        data: warrantyRecord
      });
  
    } catch (error) {
      console.error('Error updating warranty:', error);
      res.status(500).json({ message: 'Error updating warranty' });
    }
  };

  const DeleteWarranty = async (req, res) => {
    try {
      // Extract id from the request parameters
      const { id } = req.params;
  
      // Find the warranty record by its ID
      const warrantyRecord = await WarrantyMaintenanceInsurance.findOne({ where: { id } });
  
      if (!warrantyRecord) {
        return res.status(404).json({ message: 'Warranty record not found' });
      }
  
      // Delete the warranty record from the database
      await warrantyRecord.destroy();
  
      // Send a success response
      res.status(200).json({
        message: 'Warranty record deleted successfully',
      });
  
    } catch (error) {
      console.error('Error deleting warranty:', error);
      res.status(500).json({ message: 'Error deleting warranty' });
    }
  };

  const WarrantyStatusUpdate = async (req,res) => {
    try {
          const { id, status } = req.body;
          if (status !== true && status !== false) {
            return res.status(400).json({ message: 'Status must be true or false' });
          }
          const warranty = await WarrantyMaintenanceInsurance.findByPk(id);
          if (!warranty) {
            return res.status(404).json({ message: 'WarrantyMaintenanceInsurance not found' });
          }
          warranty.status = status;
          await warranty.save();
          return res.status(200).json({
            message: 'WarrantyMaintenanceInsurance status updated successfully',
            status: warranty.status
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  }

module.exports = {
  CreateWarranty,GetAllCategoryListing,GetWarrantyById,UpdateWarranty,DeleteWarranty,WarrantyStatusUpdate
};
