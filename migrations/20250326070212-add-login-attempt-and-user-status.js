"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "loginAttemptCount", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Users", "user_status", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // true = active, false = inactive
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "loginAttemptCount");
    await queryInterface.removeColumn("Users", "user_status");
  },
};
