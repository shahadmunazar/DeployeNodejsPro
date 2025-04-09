"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vendors", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false, // Vendor name is required
      },
      contact_name: {
        type: Sequelize.STRING(255),
        allowNull: true, // Optional: contact person's name
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true, // Optional: vendor's contact email
      },
      contact_phone: {
        type: Sequelize.STRING(50),
        allowNull: true, // Optional: vendor's contact phone number
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true, // Optional: vendor's address
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Default is active
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("vendors");
  },
};
