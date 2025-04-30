module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_registration', 'contractor_invitation_id', {
      type: Sequelize.INTEGER,
      allowNull: true, 
      references: {
        model: 'contractor_invitations', 
        key: 'id', 
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_registration', 'contractor_invitation_id');
  }
};
