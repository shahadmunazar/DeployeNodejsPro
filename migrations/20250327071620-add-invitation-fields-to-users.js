module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "invitation_status", {
      type: Sequelize.ENUM("pending", "accepted", "expired"),
      allowNull: false,
      defaultValue: "pending",
    });

    await queryInterface.addColumn("Users", "invite_token", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "invite_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "invitation_status");
    await queryInterface.removeColumn("Users", "invite_token");
    await queryInterface.removeColumn("Users", "invite_expires_at");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_invitation_status";');
  },
};
