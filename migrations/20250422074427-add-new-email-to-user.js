// migrations/YYYYMMDDHHMMSS-add-new-email-to-user.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'new_email', {
      type: Sequelize.STRING,
      allowNull: true,
    });

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'new_email');
  }
};
