'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ContractorOrganizationSafetyManagement extends Model {
    static associate(models) {
      ContractorOrganizationSafetyManagement.belongsTo(models.ContractorRegistration, {
        foreignKey: 'contractor_id',
        as: 'contractor',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ContractorOrganizationSafetyManagement.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    original_file_name: {
      type: DataTypes.STRING,
      allowNull: true, // Set to false if the field is mandatory
    },
    contractor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    does_organization_safety_management_system_filename: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    approved_status: {
        type: DataTypes.ENUM('approved', 'not_approved', 'pending'),
        allowNull: true,
        defaultValue: 'pending',
      },
      seen_status: {
        type: DataTypes.ENUM('seen', 'not_seen', 'pending'),
        allowNull: true,
        defaultValue: 'pending',
      },
    deletedAt:{
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
  }, {
    sequelize,
    modelName: 'ContractorOrganizationSafetyManagement',
    tableName: 'contractor_organization_safety_management',
    timestamps: false,
    paranoid: true // enables deletedAt (soft delete)
  });

  return ContractorOrganizationSafetyManagement;
};
