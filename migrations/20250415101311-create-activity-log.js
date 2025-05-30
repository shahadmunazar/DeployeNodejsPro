// migrations/XXXXXXXXXXXXXX-create-activity-log.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ActivityLogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      enquiryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Enquiries',
          key: 'id',
        },
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subAdminId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      subAdminName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW, 
        allowNull: true,
      },
      comments: {
        type: Sequelize.TEXT,  // Store large text content for comments
        allowNull: true,  // Allow null if no comments are provided
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: true,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: true,
      },
      deletedAt: {  // Soft delete field
        type: Sequelize.DATE,
        allowNull: true,  // Allow null, indicating the record is not deleted
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ActivityLogs');
  },
};
