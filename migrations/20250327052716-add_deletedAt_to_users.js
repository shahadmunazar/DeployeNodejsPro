module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true, // NULL means the user is not deleted
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "deletedAt");
  },
};
