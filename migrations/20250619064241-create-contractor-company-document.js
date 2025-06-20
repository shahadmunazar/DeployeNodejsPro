'use strict';

const { application } = require("express");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contractor_company_document', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contractor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'contractor_registration',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      policy_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      coverage_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      document_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      file_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      original_file_name: {
        type: Sequelize.STRING,
        allowNull: true, // Set to false if the field is mandatory
      },
      approved_status: {
        type: Sequelize.ENUM('approved', 'rejected', 'pending'),
        allowNull: true,
        defaultValue: 'pending', // Default status can be set as needed
      },
      seen_status: {
        type: Sequelize.STRING,
        allowNull: true,  
        defaultValue: 'unseen', // Default status can be set as needed
      },     
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true, // Allow null for soft delete
        // defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contractor_company_document');
  },
};
