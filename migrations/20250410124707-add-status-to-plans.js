'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the 'status' column to the 'plans' table
    await queryInterface.addColumn('Plans', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,  // Default value set to true (active)
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the 'status' column in case of rollback
    await queryInterface.removeColumn('Plans', 'status');
  }
};
