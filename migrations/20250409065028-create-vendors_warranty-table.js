'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Vendors_Warranty table
    await queryInterface.createTable('Vendor_warranty', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true, // Ensure vendor name is unique
      },
      contact_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true, // Validate email format
        },
      },
      contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

  async down(queryInterface, Sequelize) {
    // Drop Vendors_Warranty table if it exists
    await queryInterface.dropTable('Vendor_warranty');
  },
};
