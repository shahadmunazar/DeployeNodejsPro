'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ContractorPublicLiability extends Model {
    static associate(models) {
      ContractorPublicLiability.belongsTo(models.ContractorRegistration, {
        foreignKey: 'contractor_id',
        as: 'contractor',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  ContractorPublicLiability.init({
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
    public_liabilty_file_url: {
      type: DataTypes.STRING,
      allowNull: true,
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
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    }
  }, {
    sequelize,
    modelName: 'ContractorPublicLiability',
    tableName: 'contractor_public_liability',
    timestamps: false,
    paranoid: true 
  });

  return ContractorPublicLiability;
};
