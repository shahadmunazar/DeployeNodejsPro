'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('Plans', 'tier', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('Plans', 'price_monthly', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
      queryInterface.addColumn('Plans', 'price_yearly', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
      queryInterface.addColumn('Plans', 'price_custom', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('Plans', 'tier'),
      queryInterface.removeColumn('Plans', 'price_monthly'),
      queryInterface.removeColumn('Plans', 'price_yearly'),
      queryInterface.removeColumn('Plans', 'price_custom'),
    ]);
  }
};
