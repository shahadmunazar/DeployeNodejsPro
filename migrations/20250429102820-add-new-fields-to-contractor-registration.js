'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add employee_insure_doc_id
    await queryInterface.addColumn('contractor_registration', 'employee_insure_doc_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('contractor_registration', {
      fields: ['employee_insure_doc_id'],
      type: 'foreign key',
      name: 'fk_employee_insure_doc', // shortened name
      references: {
        table: 'contractor_register_insurance',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add public_liability_doc_id
    await queryInterface.addColumn('contractor_registration', 'public_liability_doc_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('contractor_registration', {
      fields: ['public_liability_doc_id'],
      type: 'foreign key',
      name: 'fk_public_liability_doc', // shortened name
      references: {
        table: 'contractor_public_liability',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add organization_safety_management_id
    await queryInterface.addColumn('contractor_registration', 'organization_safety_management_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('contractor_registration', {
      fields: ['organization_safety_management_id'],
      type: 'foreign key',
      name: 'fk_org_safety_mgmt', // shortened name
      references: {
        table: 'contractor_organization_safety_management',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('contractor_registration', 'fk_employee_insure_doc');
    await queryInterface.removeColumn('contractor_registration', 'employee_insure_doc_id');

    await queryInterface.removeConstraint('contractor_registration', 'fk_public_liability_doc');
    await queryInterface.removeColumn('contractor_registration', 'public_liability_doc_id');

    await queryInterface.removeConstraint('contractor_registration', 'fk_org_safety_mgmt');
    await queryInterface.removeColumn('contractor_registration', 'organization_safety_management_id');
  },
};
