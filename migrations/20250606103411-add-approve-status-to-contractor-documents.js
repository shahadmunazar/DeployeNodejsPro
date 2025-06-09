'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_documents', 'approve_status', {
      type: Sequelize.BOOLEAN,
      allowNull: true, // or false, depending on your requirements
      defaultValue: false, // or true, depending on your requirements
      after: 'uploaded', // Specify the column after which the new column should be added
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_documents', 'approve_status');
  }
};
