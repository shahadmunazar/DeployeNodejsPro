// migrations/YYYYMMDDHHMMSS-add-original-file-name-to-contractor-register-insurance.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_register_insurance', 'original_file_name', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if the field is mandatory
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_register_insurance', 'original_file_name');
  },
};
