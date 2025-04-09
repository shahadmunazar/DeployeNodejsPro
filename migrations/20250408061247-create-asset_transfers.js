"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("asset_transfers", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      asset_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: "CASCADE", // Optional: Add cascading delete behavior
      },
      from_department_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "departments", // Ensure this is correct and exists
          key: "id",
        },
        allowNull: true, // Could be null if it's a new asset or not transferred
        onDelete: "SET NULL", // Optional: Add cascading delete behavior
      },
      to_department_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "departments", // Ensure this is correct and exists
          key: "id",
        },
        allowNull: false, // Required field: asset must be transferred to a department
        onDelete: "CASCADE", // Optional: Add cascading delete behavior
      },
      transfer_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      remarks: {
        type: Sequelize.STRING(500),
        allowNull: true, // Optional field for any notes on the transfer
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("asset_transfers");
  },
};
