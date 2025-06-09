'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class ContractorRegisterInsurance extends Model {
    static associate(models) {
      ContractorRegisterInsurance.belongsTo(models.ContractorRegistration, {
        foreignKey: 'contractor_id',
        as: 'contractor',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ContractorRegisterInsurance.init({
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
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverage_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    original_file_name: {
      type: DataTypes.STRING,
      allowNull: true, // Set to false if the field is mandatory
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    document_url: {
      type: DataTypes.STRING,
      allowNull: true,
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'ContractorRegisterInsurance',
    tableName: 'contractor_register_insurance',
    timestamps: true,
    paranoid: true,
  });

  return ContractorRegisterInsurance;
};
