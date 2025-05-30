module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      
      queryInterface.addColumn('contractor_public_liability', 'deletedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeColumn('contractor_public_liability', 'deletedAt'),
    ]);
  }
};
