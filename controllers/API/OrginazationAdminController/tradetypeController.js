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
const { Op, where } = require("sequelize");
const https = require("https");
const bcrypt = require("bcrypt");
const sequelize = require("../../../config/database");
const { DataTypes } = require("sequelize");
const RefreshToken = require("../../../models/refreshToken")(sequelize, DataTypes);
const TradeTypeSelectDocument = require("../../../models/TradeTypeSelectDocument")(sequelize, DataTypes);
const TradeType = require("../../../models/trade_type")(sequelize, DataTypes);
const Country =  require("../../../models/country")(sequelize, DataTypes);
const State = require("../../../models/state")(sequelize, DataTypes);
const Cities = require("../../../models/city")(sequelize, DataTypes);
const ContractorInductionRegistration = require("../../../models/ContractorInductionRegistration")(sequelize, DataTypes);

const { response } = require("express");
const { stat } = require("fs");
const { all } = require("../../../routes/userRoutes");


const CreateTradeTypes = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../../jsonfiles/tradetypes.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    const tradeTypes = parsed.tradeTypes;
    if (!Array.isArray(tradeTypes) || tradeTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Trade types must be a non-empty array',
      });
    }
    const invalidEntry = tradeTypes.find(t => !t.name || typeof t.name !== 'string');
    if (invalidEntry) {
      return res.status(400).json({
        success: false,
        message: 'Each trade type must include a valid "name" field',
      });
    }
    const createdTradeTypes = await TradeType.bulkCreate(tradeTypes, {
      ignoreDuplicates: true,
    });

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
    const filePath = path.join(__dirname, '../../../jsonfiles/tradetypeselectdocuments.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    const tradetypeselectdocuments = parsed.selectdocuments;
    if (!Array.isArray(tradetypeselectdocuments) || tradetypeselectdocuments.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'No documents found in the JSON file',
      });
    }

    // Filter valid documents
    const validDocs = tradetypeselectdocuments.filter(doc =>
      doc.trade_type_id && doc.document_type && doc.document_types_opt_man
    );

    if (validDocs.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Each document entry must include trade_type_id, document_type, and document_types_opt_man'
      });
    }

    // Get all trade_type_ids
    const tradeTypeIds = [...new Set(validDocs.map(d => d.trade_type_id))];

    // Check which trade types exist
    const existingTradeTypes = await TradeType.findAll({
      where: { id: tradeTypeIds },
      attributes: ['id']
    });
    const validTradeTypeIds = new Set(existingTradeTypes.map(t => t.id));

    // Filter out documents with invalid trade_type_id
    const filteredDocs = validDocs.filter(doc => validTradeTypeIds.has(parseInt(doc.trade_type_id)));

    // Format for insertion
    const docsToInsert = filteredDocs.map(doc => ({
      trade_type_id: parseInt(doc.trade_type_id),
      document_type: doc.document_type,
      document_types_opt_man: doc.document_types_opt_man,
      documents_filed_name: doc.documents_filed_name 
    }));

    if (docsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'No valid documents to insert. Check if trade_type_ids exist in DB.'
      });
    }
    const createdDocs = await TradeTypeSelectDocument.bulkCreate(docsToInsert);

    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Trade type documents inserted successfully',
      inserted_count: createdDocs.length,
      data: createdDocs
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
    const { trade_type_id } = req.query; 
    const registration = await ContractorInductionRegistration.findOne({
      where: { id: trade_type_id },
      attributes: ['trade_type']
    });
    console.log("Registration",registration);
    if (!registration || !registration.trade_type) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: 'No trade_type found for the given contractor registration ID'
      });
    }
    let tradeTypeIds = [];
        try {
          // const parsed = JSON.parse(registration.trade_type); // results in ["1,2,3,4,5"]
          // if (Array.isArray(parsed)) {
          //   parsed.forEach(item => {
          //     item.split(',').forEach(id => {
          //       const numId = parseInt(id.trim());
          //       if (!isNaN(numId)) tradeTypeIds.push(numId);
          //     });
          //   });
          // }
            // registration.trade_type is already an array like ['2,3']
          const parsed = Array.isArray(registration.trade_type)
            ? registration.trade_type
            : [registration.trade_type];

          parsed.forEach(item => {
            if (typeof item === 'string') {
              item.split(',').forEach(id => {
                const numId = parseInt(id.trim());
                if (!isNaN(numId)) tradeTypeIds.push(numId);
              });
            }
          });
        } catch (err) {
          console.error("Failed to parse trade_type:", err.message);
        }
    console.log("Parsed Trade Type IDs:", tradeTypeIds);
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

    const documentMap = {};
    for (const doc of allDocuments) {
      const key = doc.document_type;
      const existing = documentMap[key];
      if (!existing || (existing.document_types_opt_man === 'optional' && doc.document_types_opt_man === 'mandatory')) {
        documentMap[key] = doc;
      }
    }
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
          name: {
            [Op.like]: `%${search}%`
          }
        }
      : {};
    const allcountries = await Country.findAll({
      where: whereClause
    });

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
      message: 'Countries and their states retrieved successfully',
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


const AddedAllStatesByCountry = async (req, res) => {
  try {
    const { country_id } = req.query;
    const filePath = path.join(__dirname, '../../../jsonfiles/states.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    const states = parsed.states;

    if (!Array.isArray(states) || states.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'No states found in the JSON file'
      });
    }

    const invalid = states.find(s => !s.country_id || !s.name);
    if (invalid) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Each state must include at least name and country_id'
      });
    }
    const filteredStates = country_id
      ? states.filter(s => s.country_id == country_id)
      : states;
    const formattedStates = filteredStates.map(s => ({
      state_name: s.name,
      state_code: s.state_code || null,
      slug: s.name.toLowerCase().replace(/\s+/g, '-'),
      country_id: s.country_id,
      status: true
    }));
    const addedStates = await State.bulkCreate(formattedStates, { ignoreDuplicates: true });
    return res.status(200).json({
      success: true,
      status: 200,
      data: addedStates
    });
  } catch (error) {
    console.error("Error adding states:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

const AddedCitiesByStatesCountry = async (req, res) => {
  try {
    const { state_id } = req.query;
    const filePath = path.join(__dirname, '../../../jsonfiles/cities.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    const cities = parsed.cities;
    if (!Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'No cities found in the JSON file'
      });
    }
    const invalid = cities.find(c => !c.country_id || !c.name || !c.state_id);
    if (invalid) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'Each city must include name, country_id, and state_id'
      });
    }
    const filteredCities = state_id
      ? cities.filter(c => c.state_id == state_id)
      : cities;
    const formattedCities = filteredCities.map(c => ({
      city_name: c.name,
      city_code: c.city_code || null,
      slug: c.name.toLowerCase().replace(/\s+/g, '-'),
      state_id: c.state_id,
      country_id: c.country_id,
      status: true
    }));
    const batchSize = 1000;
    const addedCities = [];
    for (let i = 0; i < formattedCities.length; i += batchSize) {
      const batch = formattedCities.slice(i, i + batchSize);
      const result = await Cities.bulkCreate(batch, {
        ignoreDuplicates: true
      });
      addedCities.push(...result);
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: `${addedCities.length} cities added successfully`,
      data: addedCities
    });

  } catch (error) {
    console.error("Error adding cities:", error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

const GetStatesbyCountry = async (req, res) => {
  try {
    const { country_id, name } = req.query;
    const whereCondition = {};

    if (country_id) {
      whereCondition.country_id = country_id;
    }

    if (name) {
      whereCondition.state_name = {
        [Op.like]: `%${name}%`,
      };
    }

    const findStates = await State.findAll({
      where: whereCondition,
    });

    return res.status(200).json({
      success: true,
      data: findStates,
      status: 200,
      message: 'States retrieved successfully.',
    });
  } catch (error) {
    console.error("Error in GetStatesbyCountry:", error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving states.',
      error: error.message,
      status: 500,
    });
  }
};


const GetCitySelectedState = async (req, res) => {
  try {
    const { states_id, name } = req.query;
    const whereCondition = {};
    if (states_id) {
      whereCondition.state_id = states_id;
    }
    if (name) {
      whereCondition.city_name = {
        [Op.like]: `%${name}%`,
      };
    }
    const findCities = await Cities.findAll({
      where: whereCondition,
    });
    return res.status(200).json({
      success: true,
      data: findCities,
      status: 200,
      message: "Cities retrieved successfully.",
    });
  } catch (error) {
    console.error("Error in GetCitySelectedState:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving cities.",
      error: error.message,
      status: 500,
    });
  }
};

module.exports = {
  CreateTradeTypes,
  GetAllTradeTypes,
  TradeTypeDoucmentCreate,
  GetTradeTypeselectDocuments,
  AddedAllCountry,
  getAllCountry,
  AddedAllStatesByCountry,
  AddedCitiesByStatesCountry,
  GetStatesbyCountry,
  GetCitySelectedState
};
