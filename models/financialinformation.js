'use strict';
module.exports = (sequelize, DataTypes) => {
  const FinancialInformation = sequelize.define('FinancialInformation', {
    capitalization_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    end_of_life_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    capitalization_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    depreciation_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    accumulated_depreciation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    scrap_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    income_tax_depreciation_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    tableName: 'FinancialInformations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return FinancialInformation;
};
