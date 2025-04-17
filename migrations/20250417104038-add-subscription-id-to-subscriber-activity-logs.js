'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('subscriber_activity_logs', 'subscriptionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'organization_subscribeuser',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('subscriber_activity_logs', 'subscriptionId');
  }
};
