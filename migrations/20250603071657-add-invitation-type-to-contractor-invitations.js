'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contractor_invitations', 'invitation_type', {
      type: Sequelize.ENUM(
        'contractor_invitation',
        'contractor_induction',
        'contractor_admin_induction',
        'contractor_user_induction',
        'staff',
        'compliance_manager'
      ),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contractor_invitations', 'invitation_type');
  },
};
