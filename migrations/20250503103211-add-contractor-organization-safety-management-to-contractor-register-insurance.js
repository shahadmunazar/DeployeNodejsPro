// migrations/YYYYMMDDHHMMSS-add-contractor-organization-safety-management-to-contractor-register-insurance.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_organization_safety_management', 'original_file_name', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if the field is mandatory
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_organization_safety_management', 'original_file_name');
  },
};
