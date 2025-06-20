'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('contractor_registration', 'employee_insure_doc_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'submission_status', // Add after submission_status
    });

    await queryInterface.addColumn('contractor_registration', 'public_liability_doc_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'employee_insure_doc_id', // Add after employee_insure_doc_id
    });

    await queryInterface.addColumn('contractor_registration', 'organization_safety_management_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'public_liability_doc_id', // Add after public_liability_doc_id
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('contractor_registration', 'employee_insure_doc_id');
    await queryInterface.removeColumn('contractor_registration', 'public_liability_doc_id');
    await queryInterface.removeColumn('contractor_registration', 'organization_safety_management_id');
  },
};