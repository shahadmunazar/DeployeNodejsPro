'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'status' column to indicate if the record is active or inactive
    await queryInterface.addColumn('FinancialInformations', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,  // Default value 'true' for active status
    });

    // Add 'deleted_at' column for soft delete functionality
    await queryInterface.addColumn('FinancialInformations', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true, // Can be null to indicate the record is not deleted
      defaultValue: null, // Default value is null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'status' column
    await queryInterface.removeColumn('FinancialInformations', 'status');

    // Remove 'deleted_at' column
    await queryInterface.removeColumn('FinancialInformations', 'deletedAt');
  },
};
