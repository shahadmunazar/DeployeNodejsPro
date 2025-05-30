// migrations/YYYYMMDDHHMMSS-add-softdelete-to-assetcategories.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the `deletedAt` column to the 'AssetCategories' table for soft delete
    await queryInterface.addColumn('AssetCategories', 'deletedAt', {
      type: Sequelize.DATE,  // Date type for the deletedAt column
      allowNull: true,       // Can be null initially, meaning the record is not deleted
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the `deletedAt` column in case of rollback
    await queryInterface.removeColumn('AssetCategories', 'deletedAt');
  }
};
