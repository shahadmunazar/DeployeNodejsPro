// migrations/YYYYMMDDHHMMSS-add-new-email-to-user.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'new_email', {
      type: Sequelize.STRING,
      allowNull: true,
    });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'new_email');
  }
};
