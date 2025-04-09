'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('FinancialInformations', 'asset_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // asset_id must be set
      references: {
        model: 'assets', // Foreign key to the assets table
        key: 'id', // The column in the assets table (id)
      },
      onDelete: 'CASCADE', // If the asset is deleted, the financial information record will also be deleted
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('FinancialInformations', 'asset_id');
  },
};
