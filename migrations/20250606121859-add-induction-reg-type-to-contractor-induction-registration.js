'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_induction_registration', 'induction_reg_type', {
      type: Sequelize.ENUM('contractor_admin', 'contractor'),
      allowNull: true, // or false, depending on your requirements
      defaultValue: 'contractor_admin', // Set a default value if needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_induction_registration', 'induction_reg_type');
  }
};
