'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ContractorCompanyDocument extends Model {
    static associate(models) {
      ContractorCompanyDocument.belongsTo(models.ContractorRegistration, {
        foreignKey: 'contractor_id',
        as: 'contractor',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ContractorCompanyDocument.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    contractor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    policy_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    original_file_name: {
      type: DataTypes.STRING,
      allowNull: true, // Set to false if the field is mandatory
    },
    coverage_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    document_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    approved_status: {
        type: DataTypes.ENUM('approved', 'rejected', 'pending'),
        allowNull: true,
        defaultValue: 'pending',
      },
      seen_status: {
        type: DataTypes.ENUM('seen', 'unseen'),
        allowNull: true,
        defaultValue: 'unseen',
      },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    deletedAt:{
      type: DataTypes.DATE,
      allowNull: true,
      // defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
  }, {
    sequelize,
    modelName: 'ContractorCompanyDocument',
    tableName: 'contractor_company_document',
    timestamps: true,
    paranoid: true 
  });

  return ContractorCompanyDocument;
};
