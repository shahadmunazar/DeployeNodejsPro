const User = require("../../../models/user");
const jwt = require("jsonwebtoken");
// const UserRole = require("../../../models/userrole");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const Role = require("../../../models/role");
const momentTimeZone = require("moment-timezone"); // Import moment-timezone
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Op } = require("sequelize");
const https = require("https");
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const RefreshToken = require("../../../models/refreshToken")(sequelize, DataTypes);
const TradeTypeSelectDocument = require("../../../models/TradeTypeSelectDocument")(sequelize, DataTypes);
const TradeType = require("../../../models/trade_type")(sequelize, DataTypes);
const Country =  require("../../../models/country")(sequelize, DataTypes);
const ContractorInductionRegistration = require("../../../models/ContractorInductionRegistration")(sequelize, DataTypes);

const { response } = require("express");
const { stat } = require("fs");
const { all } = require("../../../routes/userRoutes");


const CreateTradeTypes = async (req, res) => {
  try {
    const tradeTypes = req.body.tradeTypes; // Expecting an array of { name, description, status }

    if (!Array.isArray(tradeTypes) || tradeTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Trade types must be a non-empty array',
      });
    }

    const createdTradeTypes = await TradeType.bulkCreate(tradeTypes);

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Trade types created successfully',
      data: createdTradeTypes,
    });
  } catch (error) {
    console.error('Error creating trade types:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create trade types',
      error: error.message,
    });
  }
};

const GetAllTradeTypes = async (req, res) => {
  try {
    const getAllTrades = await TradeType.findAll({
      where: {
        status: true
      },
      attributes: ['id', 'name']
    });
    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Trade types retrieved successfully',
      data: getAllTrades
    });

  } catch (error) {
    console.error('Error fetching trade types:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve trade types',
      error: error.message
    });
  }
};

const TradeTypeDoucmentCreate = async (req, res) => {
  try {
    const { trade_type_id, documents_types, document_types_opt_man } = req.body;
    console.log("Incoming request body:", req.body);
    if (!trade_type_id || !documents_types || !document_types_opt_man) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Trade type ID, document types, and document type (optional/mandatory) are required'
      });
    }
    const createdDocumentTradeTypes = await TradeTypeSelectDocument.create({
      trade_type_id,
      document_type:documents_types,
      document_types_opt_man
    });
    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Trade type document created successfully',
      data: createdDocumentTradeTypes
    });
  } catch (error) {
    console.error('Error creating trade type document:', error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Failed to create trade type document',
      error: error.message
    });
  }
};

const GetTradeTypeselectDocuments = async (req, res) => {
  try {
    const { trade_type_id } = req.body; // this is the ContractorInductionRegistration ID

    // Fetch the related trade_type string from ContractorInductionRegistration
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

    // Fetch documents
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

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Documents grouped by mandatory and optional',
      data: result
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

const AddedAllCountry = async (req, res)=>{
try {
    const filePath = path.join(__dirname, '../../../jsonfiles/allcountries.json'); // Adjust path as needed
  console.log("File path:", filePath);
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    const countries = parsed.countries;
    if (!Array.isArray(countries) || countries.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'No countries found in the JSON file'
      });
    }

    // Basic validation for country_name and country_code
    const invalid = countries.find(c => !c.name);
    if (invalid) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Each country must include at least country_name and country_code'
      });
    }

    // Insert all countries
    const addedCountries = await Country.bulkCreate(countries);

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'All countries added successfully',
      data: addedCountries
    });

  } catch (error) {
    console.error('Error adding countries:', error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
}

const getAllCountry = async (req, res) => {
  try {
    const { search } = req.query;

    const whereClause = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
          ]
        }
      : {};

    const allcountries = await Country.findAll({ where: whereClause });

    if (!allcountries.length) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'No countries found matching the search criteria'
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Countries retrieved successfully',
      data: allcountries
    });
  } catch (error) {
    console.error('Error retrieving countries:', error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  CreateTradeTypes,
  GetAllTradeTypes,
  TradeTypeDoucmentCreate,
  GetTradeTypeselectDocuments,
  AddedAllCountry,
  getAllCountry
};
