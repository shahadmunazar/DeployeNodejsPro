'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contractor_induction_registration', 'agree_terms', {
      type: Sequelize.ENUM('sent', 'pending','submit','retrytoprocess','failed'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contractor_induction_registration', 'agree_terms');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_contractor_induction_registration_agree_terms";'); // Clean ENUM
  }
};
