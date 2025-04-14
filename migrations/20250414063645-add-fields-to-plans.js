'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('plans', 'tier', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('plans', 'price_monthly', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
      queryInterface.addColumn('plans', 'price_yearly', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
      queryInterface.addColumn('plans', 'price_custom', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('plans', 'tier'),
      queryInterface.removeColumn('plans', 'price_monthly'),
      queryInterface.removeColumn('plans', 'price_yearly'),
      queryInterface.removeColumn('plans', 'price_custom'),
    ]);
  }
};
