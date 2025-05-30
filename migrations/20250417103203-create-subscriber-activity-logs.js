'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscriber_activity_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      organizationId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      organizationName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      oldPlan: {
        type: Sequelize.STRING
      },
      newPlan: {
        type: Sequelize.STRING
      },
      effectiveDate: {
        type: Sequelize.DATE
      },
      statusBefore: {
        type: Sequelize.STRING
      },
      statusAfter: {
        type: Sequelize.STRING
      },
      reason: {
        type: Sequelize.TEXT
      },
      performedByAdminId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      performedByAdminName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      notificationSent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscriber_activity_logs');
  }
};
