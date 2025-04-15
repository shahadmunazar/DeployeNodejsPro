'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Enquiries', 'lead_status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true, // 
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Enquiries', 'lead_status');
  }
};
