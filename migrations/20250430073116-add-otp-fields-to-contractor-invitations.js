'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contractor_invitations', 'OneTimePass', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('contractor_invitations', 'otpExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contractor_invitations', 'OneTimePass');
    await queryInterface.removeColumn('contractor_invitations', 'otpExpiresAt');
  }
};
