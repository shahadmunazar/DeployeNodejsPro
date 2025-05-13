module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'login_at', {
      type: Sequelize.DATE,
      allowNull: true, // Initially null until user logs in
    });

    await queryInterface.addColumn('users', 'logout_at', {
      type: Sequelize.DATE,
      allowNull: true, // Initially null until user logs out
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'login_at');
    await queryInterface.removeColumn('users', 'logout_at');
  }
};
