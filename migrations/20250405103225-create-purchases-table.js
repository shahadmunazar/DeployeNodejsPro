// migrations/YYYYMMDDHHMMSS-create-purchases-table.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Purchases', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      vendor_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      po_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      invoice_date: {
        type: Sequelize.DATEONLY, 
        allowNull: false,
      },
      invoice_no: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      purchase_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      ownership_type: {
        type: Sequelize.ENUM('Self-Owned', 'Partner'),
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
    await queryInterface.dropTable('Purchases');
  },
};
