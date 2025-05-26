const User = require("../../../models/user");
const jwt = require("jsonwebtoken");
// const UserRole = require("../../../models/userrole");
const { body, validationResult } = require("express-validator");
const moment = require("moment");
const Role = require("../../../models/role");
const momentTimeZone = require("moment-timezone"); // Import moment-timezone
const { v4: uuidv4 } = require("uuid");

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

const { response } = require("express");
const { stat } = require("fs");


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
    const { trade_type_id } = req.body;
    if (!Array.isArray(trade_type_id) || trade_type_id.length === 0) {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'trade_type_id must be a non-empty array in the body'
      });
    }
    const tradeTypeIds = trade_type_id.map(id => parseInt(id)).filter(id => !isNaN(id));
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
    const filteredDocuments = Object.values(documentMap);
    return res.status(200).json({
      success: true,
      status: 200,
      message: 'Filtered documents fetched successfully',
      data: filteredDocuments
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

module.exports = {
  CreateTradeTypes,
  GetAllTradeTypes,
  TradeTypeDoucmentCreate,
  GetTradeTypeselectDocuments
};
