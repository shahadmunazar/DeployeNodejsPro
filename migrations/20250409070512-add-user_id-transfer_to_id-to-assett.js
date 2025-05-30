'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the user_id and transfer_to_id columns to the assets table
    await queryInterface.addColumn('assets', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Reference to the 'users' table
        key: 'id',
      },
      onDelete: 'SET NULL', // If the user is deleted, set to NULL
    });

    await queryInterface.addColumn('assets', 'transfer_to_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Reference to the 'users' table
        key: 'id',
      },
      onDelete: 'SET NULL', // If the user is deleted, set to NULL
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes by removing the user_id and transfer_to_id columns
    await queryInterface.removeColumn('assets', 'user_id');
    await queryInterface.removeColumn('assets', 'transfer_to_id');
  }
};
