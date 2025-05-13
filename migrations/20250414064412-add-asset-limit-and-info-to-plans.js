'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('plans', 'asset_limit', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('plans', 'additional_info', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('plans', 'asset_limit'),
      queryInterface.removeColumn('plans', 'additional_info'),
    ]);
  },
};
