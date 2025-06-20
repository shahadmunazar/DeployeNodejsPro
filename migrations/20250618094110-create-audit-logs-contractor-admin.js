'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs_contractor_admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
       contractor_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Assuming nullable since not specified as NOT NULL
        references: {
          model: 'contractor_registration',
          key: 'id',
        },
        onDelete: 'CASCADE', // Assuming you want to set to NULL if contractor is deleted
      },
      entity_type: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      entity_id: {
        type: Sequelize.INTEGER,
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
        type: Sequelize.STRING,
        allowNull: true,
      },
      action: {
        type: Sequelize.ENUM('sent', 'accepted', 'expired', 'uploaded', 'approved', 'rejected', 'resubmission_requested', 'acknowledged', 'finalized')
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
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
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_logs_contractor_admins');
  }
};