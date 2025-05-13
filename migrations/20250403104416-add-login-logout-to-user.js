module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'login_at', {
      type: Sequelize.DATE,
      allowNull: true, // Initially null until user logs in
    });

    await queryInterface.addColumn('Users', 'logout_at', {
      type: Sequelize.DATE,
      allowNull: true, // Initially null until user logs out
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'login_at');
    await queryInterface.removeColumn('Users', 'logout_at');
  }
};
