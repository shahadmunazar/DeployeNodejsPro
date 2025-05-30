module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "invitation_status", {
      type: Sequelize.ENUM("pending", "accepted", "expired","sent"),
      allowNull: false,
      defaultValue: "pending",
    });

    await queryInterface.addColumn("users", "invite_token", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "invite_expires_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "invitation_status");
    await queryInterface.removeColumn("users", "invite_token");
    await queryInterface.removeColumn("users", "invite_expires_at");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_invitation_status";');
  },
};
