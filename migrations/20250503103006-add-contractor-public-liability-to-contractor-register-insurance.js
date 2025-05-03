// migrations/YYYYMMDDHHMMSS-add-contractor-public-liability-to-contractor-register-insurance.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_public_liability', 'original_file_name', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if the field is mandatory
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_public_liability', 'original_file_name');
  },
};
