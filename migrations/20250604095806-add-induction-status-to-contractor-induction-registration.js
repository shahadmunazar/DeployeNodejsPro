'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_induction_registration', 'induction_status', {
      type: Sequelize.ENUM('approved', 'rejected', 'recheck', 'pending'),
      allowNull: true,
      defaultValue: 'pending'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_induction_registration', 'induction_status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_contractor_induction_registration_induction_status";');
  }
};
