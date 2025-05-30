'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Purchases', 'asset_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Make sure the asset_id cannot be null
      references: {
        model: 'assets', // The referenced table (assets)
        key: 'id', // The column in the assets table (id)
      },
      onDelete: 'CASCADE', // If the asset is deleted, the purchase record will be deleted
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Purchases', 'asset_id');
  },
};
