"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "loginAttemptCount", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("users", "user_status", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // true = active, false = inactive
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "loginAttemptCount");
    await queryInterface.removeColumn("users", "user_status");
  },
};
