const { body, validationResult } = require("express-validator");
const sequelize = require("../../../config/database"); // adjust path if needed
const { DataTypes } = require("sequelize");
const FinancialInformationModel = require("../../../models/financialinformation")(sequelize, DataTypes);

const moment = require('moment');  // Import moment.js for date formatting

// Validation rules for creating financial information
const validateFinancialInformation = [
  body('capitalization_price')
    .isDecimal().withMessage('Capitalization Price must be a decimal number')
    .notEmpty().withMessage('Capitalization Price is required'),
  body('end_of_life_date')
    .isDate().withMessage('End of Life Date must be a valid date')
    .notEmpty().withMessage('End of Life Date is required'),
  body('capitalization_date')
    .isDate().withMessage('Capitalization Date must be a valid date')
    .notEmpty().withMessage('Capitalization Date is required'),
  body('depreciation_percentage')
    .isFloat().withMessage('Depreciation Percentage must be a valid number')
    .notEmpty().withMessage('Depreciation Percentage is required'),
  body('accumulated_depreciation')
    .isDecimal().withMessage('Accumulated Depreciation must be a decimal number')
    .notEmpty().withMessage('Accumulated Depreciation is required'),
  body('scrap_value')
    .isDecimal().withMessage('Scrap Value must be a decimal number')
    .notEmpty().withMessage('Scrap Value is required'),
  body('income_tax_depreciation_percentage')
    .isFloat().withMessage('Income Tax Depreciation Percentage must be a valid number')
    .notEmpty().withMessage('Income Tax Depreciation Percentage is required'),
];

// Create Financial Information
const CreateFinancial = async (req, res) => {
  try {
    // Validate the request
    await Promise.all(validateFinancialInformation.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from the request body
    const {
      capitalization_price,
      end_of_life_date,
      capitalization_date,
      depreciation_percentage,
      accumulated_depreciation,
      scrap_value,
      income_tax_depreciation_percentage,
    } = req.body;

    // Create new financial record
    const newFinancialInformation = await FinancialInformationModel.create({
      capitalization_price,
      end_of_life_date,
      capitalization_date,
      depreciation_percentage,
      accumulated_depreciation,
      scrap_value,
      income_tax_depreciation_percentage,
    });

    // Respond with the created record
    res.status(201).json({
      message: 'Financial Information created successfully',
      data: newFinancialInformation,
    });
  } catch (error) {
    console.error('Error creating financial information:', error);
    res.status(500).json({ message: 'Error creating financial information' });
  }
};
const GetFinancialList = async (req, res) => {
    try {
      const financialRecords = await FinancialInformationModel.findAll();
      const formattedFinancialRecords = financialRecords.map(record => {
        return {
          ...record.toJSON(),
          capitalization_date: moment(record.capitalization_date).format('DD/MM/YYYY'),
          end_of_life_date: moment(record.end_of_life_date).format('DD/MM/YYYY'),
        };
      });
      res.status(200).json({
        message: 'Financial Information fetched successfully',
        data: formattedFinancialRecords,
      });
  
    } catch (error) {
      console.error('Error fetching financial information:', error);
      res.status(500).json({ message: 'Error fetching financial information' });
    }
  };

  const GetFinancialListById = async (req, res) => {
    const { id } = req.params;  // Extract the id from the request parameters
  
    try {
      // Fetch the financial information using findByPk (primary key lookup)
      const financial = await FinancialInformationModel.findByPk(id);
  
      // If no financial record is found, return a 404 error with a meaningful message
      if (!financial) {
        return res.status(404).json({ message: "Financial information not found" });
      }
  
      // Format date fields using moment.js
      const formattedFinancial = {
        ...financial.toJSON(),
        capitalization_date: moment(financial.capitalization_date).format('DD/MM/YYYY'),
        end_of_life_date: moment(financial.end_of_life_date).format('DD/MM/YYYY'),
      };
  
      // Return the financial information with formatted dates
      return res.status(200).json({
        message: "Financial information fetched successfully",
        data: formattedFinancial
      });
  
    } catch (error) {
      console.error("Error fetching financial information:", error);
      return res.status(500).json({
        message: "Error fetching financial information",
        error: error.message,
      });
    }
  };

  const validateFinancialInformationUpdate = [
    body('capitalization_price')
      .isDecimal().withMessage('Capitalization Price must be a decimal number')
      .optional(),
    body('end_of_life_date')
      .isDate().withMessage('End of Life Date must be a valid date')
      .optional(),
    body('capitalization_date')
      .isDate().withMessage('Capitalization Date must be a valid date')
      .optional(),
    body('depreciation_percentage')
      .isFloat().withMessage('Depreciation Percentage must be a valid number')
      .optional(),
    body('accumulated_depreciation')
      .isDecimal().withMessage('Accumulated Depreciation must be a decimal number')
      .optional(),
    body('scrap_value')
      .isDecimal().withMessage('Scrap Value must be a decimal number')
      .optional(),
    body('income_tax_depreciation_percentage')
      .isFloat().withMessage('Income Tax Depreciation Percentage must be a valid number')
      .optional(),
  ];
  
  const UpdateFinancial = async (req, res) => {
    const { id } = req.params;  // Extract the ID from request parameters
  
    try {
      // Validate the request body using express-validator
      await Promise.all(validateFinancialInformationUpdate.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // Find the financial record by ID
      const financial = await FinancialInformationModel.findByPk(id);
  
      // If no record is found, return a 404 error
      if (!financial) {
        return res.status(404).json({ message: 'Financial information not found' });
      }
  
      // Extract fields from the request body
      const {
        capitalization_price,
        end_of_life_date,
        capitalization_date,
        depreciation_percentage,
        accumulated_depreciation,
        scrap_value,
        income_tax_depreciation_percentage,
      } = req.body;
  
      // Prepare an object for the update that only includes fields that have changed
      const updateData = {};
  
      if (capitalization_price && capitalization_price !== financial.capitalization_price) {
        updateData.capitalization_price = capitalization_price;
      }
      if (end_of_life_date && end_of_life_date !== financial.end_of_life_date) {
        updateData.end_of_life_date = end_of_life_date;
      }
      if (capitalization_date && capitalization_date !== financial.capitalization_date) {
        updateData.capitalization_date = capitalization_date;
      }
      if (depreciation_percentage && depreciation_percentage !== financial.depreciation_percentage) {
        updateData.depreciation_percentage = depreciation_percentage;
      }
      if (accumulated_depreciation && accumulated_depreciation !== financial.accumulated_depreciation) {
        updateData.accumulated_depreciation = accumulated_depreciation;
      }
      if (scrap_value && scrap_value !== financial.scrap_value) {
        updateData.scrap_value = scrap_value;
      }
      if (income_tax_depreciation_percentage && income_tax_depreciation_percentage !== financial.income_tax_depreciation_percentage) {
        updateData.income_tax_depreciation_percentage = income_tax_depreciation_percentage;
      }
  
      // If no fields are different, return a message indicating that no update was made
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'No fields have been updated' });
      }
  
      // Update the financial record with the new data
      const updatedFinancial = await financial.update(updateData);
  
      // Return the updated financial record
      return res.status(200).json({
        message: 'Financial information updated successfully',
        data: updatedFinancial,
      });
  
    } catch (error) {
      console.error('Error updating financial information:', error);
      return res.status(500).json({
        message: 'Error updating financial information',
        error: error.message,
      });
    }
  };
  

module.exports = {
  CreateFinancial,GetFinancialList,GetFinancialListById,UpdateFinancial
};
