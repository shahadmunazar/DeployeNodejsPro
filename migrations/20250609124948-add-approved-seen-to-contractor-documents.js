'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_documents', 'approved_status', {
      type: Sequelize.ENUM('approved', 'not_approved', 'pending'),
      allowNull: true,
      defaultValue: 'pending',
    });

    await queryInterface.addColumn('contractor_documents', 'seen_status', {
      type: Sequelize.ENUM('seen', 'not_seen', 'pending'),
      allowNull: true,
      defaultValue: 'pending',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('contractor_documents', 'approved_status');
    await queryInterface.removeColumn('contractor_documents', 'seen_status');
  }
};
