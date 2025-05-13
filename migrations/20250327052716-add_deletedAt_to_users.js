module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true, // NULL means the user is not deleted
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "deletedAt");
  },
};
