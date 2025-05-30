module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('contractor_registration', 'postal_code', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('contractor_registration', 'postal_code');
  }
};
