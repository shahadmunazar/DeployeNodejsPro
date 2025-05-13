'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'activation_expires_at', {
      type: Sequelize.DATE,
      allowNull: true, // or false depending on your logic
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'activation_expires_at');
  }
};
