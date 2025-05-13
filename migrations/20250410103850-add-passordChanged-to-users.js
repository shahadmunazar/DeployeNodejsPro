'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'passwordChanged', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // or true based on your logic
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'passwordChanged');
  },
};
