'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('trade_type_select_documents', 'documents_filed_name', {
      type: Sequelize.STRING,
      allowNull: true,  // or true if nullable
    });

    await queryInterface.addColumn('trade_type_select_documents', 'trade_type_select_documents', {
      type: Sequelize.STRING,
      allowNull: true,  // change as per your requirement
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('trade_type_select_documents', 'documents_filed_name');
    await queryInterface.removeColumn('trade_type_select_documents', 'trade_type_select_documents');
  }
};
