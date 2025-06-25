'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('contractor_registration', 'compliance_status', {
      type: Sequelize.ENUM('pending', 'compliance', 'non-compliance'),
      allowNull: true,
      after: 'comments_history', // Add after submission_status
      defaultValue: 'pending', // Default value set to 'pending'
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('contractor_registration', 'compliance_status');
  }
};
