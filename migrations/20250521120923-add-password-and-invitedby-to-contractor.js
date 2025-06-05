'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_induction_registration', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('contractor_induction_registration', 'invited_by_organization', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Add foreign key with shorter constraint name
    await queryInterface.addConstraint('contractor_induction_registration', {
      fields: ['invited_by_organization'],
      type: 'foreign key',
      name: 'fk_invited_by_org', // shorter name
      references: {
        table: 'contractor_invitations',
        field: 'invited_by',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('contractor_induction_registration', 'fk_invited_by_org');
    await queryInterface.removeColumn('contractor_induction_registration', 'invited_by_organization');
    await queryInterface.removeColumn('contractor_induction_registration', 'password');
  }
};
