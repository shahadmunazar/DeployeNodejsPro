'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('contractor_induction_registration', 'confirm_mandatoryDocumentUpload', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
      queryInterface.addColumn('contractor_induction_registration', 'confirm_optionalDocumentUpload', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
      queryInterface.addColumn('contractor_induction_registration', 'mandatoryDocumentUpload', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('contractor_induction_registration', 'optionalDocumentUpload', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('contractor_induction_registration', 'confirm_mandatoryDocumentUpload'),
      queryInterface.removeColumn('contractor_induction_registration', 'confirm_optionalDocumentUpload'),
      queryInterface.removeColumn('contractor_induction_registration', 'mandatoryDocumentUpload'),
      queryInterface.removeColumn('contractor_induction_registration', 'optionalDocumentUpload'),
    ]);
  }
};
