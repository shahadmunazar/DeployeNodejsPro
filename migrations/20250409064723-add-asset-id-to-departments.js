'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add asset_id column to departments table
    await queryInterface.addColumn('departments', 'asset_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // This field can be nullable
      references: {
        model: 'assets', // Foreign key to the assets table
        key: 'id', // Refers to the `id` column in the assets table
      },
      onDelete: 'SET NULL', // If the asset is deleted, set the asset_id to null
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the asset_id column from departments table
    await queryInterface.removeColumn('departments', 'asset_id');
  },
};
