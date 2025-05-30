'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_documents', 'uploadedDocumentsType', {
      type: Sequelize.ENUM('mandatory', 'optional'),
      allowNull: true,
      after: 'document_type_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_documents', 'uploadedDocumentsType');
  }
};
