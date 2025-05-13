'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('Plans', 'asset_limit', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn('Plans', 'additional_info', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('Plans', 'asset_limit'),
      queryInterface.removeColumn('Plans', 'additional_info'),
    ]);
  },
};
