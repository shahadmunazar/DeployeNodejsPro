'use strict';

// const contractor_document = require("../models/contractor_document");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs_contractors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      contractor_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Assuming nullable since not specified as NOT NULL
        references: {
          model: 'contractor_induction_registration',
          key: 'id',
        },
        onDelete: 'CASCADE', // Assuming you want to set to NULL if contractor is deleted
      },
      entity_type: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      entity_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      reviewer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      reviewer_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      action: {
        type: Sequelize.ENUM(
          'sent',
          'accepted',
          'expired',
          'uploaded',
          'approved',
          'rejected',
          'resubmission_requested',
          'acknowledged',
          'finalized'
        ),
        allowNull: false,
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      contractor_type: {
        type: Sequelize.ENUM('contractor_admin', 'contractor'),
        allowNull: true, // Assuming nullable since not specified as NOT NULL
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('audit_logs_contractors');
  },
};