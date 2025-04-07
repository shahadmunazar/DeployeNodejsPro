'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('FinancialInformations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      capitalization_price: {
        type: Sequelize.DECIMAL(10, 2),  // Numeric type with 2 decimal places
        allowNull: false,
      },
      end_of_life_date: {
        type: Sequelize.DATEONLY,  // Date-only type (yyyy-mm-dd)
        allowNull: false,
      },
      capitalization_date: {
        type: Sequelize.DATEONLY,  // Date-only type (yyyy-mm-dd)
        allowNull: false,
      },
      depreciation_percentage: {
        type: Sequelize.FLOAT,  // Percentage value as float
        allowNull: false,
      },
      accumulated_depreciation: {
        type: Sequelize.DECIMAL(10, 2),  // Numeric type with 2 decimal places
        allowNull: false,
        defaultValue: 0.00,
      },
      scrap_value: {
        type: Sequelize.DECIMAL(10, 2),  // Numeric type with 2 decimal places
        allowNull: false,
        defaultValue: 0.00,
      },
      income_tax_depreciation_percentage: {
        type: Sequelize.FLOAT,  // Percentage value as float
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('FinancialInformations');
  },
};
