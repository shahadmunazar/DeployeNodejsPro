'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contractor_registration', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contractor_registration', 'status');
  }
};
