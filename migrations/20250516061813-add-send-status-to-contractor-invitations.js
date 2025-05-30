'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_invitations', 'send_status', {
      type: Sequelize.ENUM('sent', 'failed', 'pending','resend'),
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_invitations', 'send_status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_contractor_invitations_send_status";');
  }
};
