'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('organization_subscribeuser', 'payment_status', {
        type: Sequelize.ENUM('Paid', 'Due', 'Overdue'),
        allowNull: false,
        defaultValue: 'Due',
      }),
      queryInterface.addColumn('organization_subscribeuser', 'renewal_date', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
      queryInterface.addColumn('organization_subscribeuser', 'subscription_status', {
        type: Sequelize.ENUM('Active', 'Expired', 'Canceled'),
        allowNull: false,
        defaultValue: 'Active',
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('organization_subscribeuser', 'payment_status'),
      queryInterface.removeColumn('organization_subscribeuser', 'renewal_date'),
      queryInterface.removeColumn('organization_subscribeuser', 'subscription_status'),
      queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organization_subscribeuser_payment_status";'),
      queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_organization_subscribeuser_subscription_status";'),
    ]);
  }
};
