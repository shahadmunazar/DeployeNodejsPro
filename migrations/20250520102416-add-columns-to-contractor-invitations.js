"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("contractor_invitations", "approval_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("contractor_invitations", "inclusion_list", {
      type: Sequelize.STRING, // Or Sequelize.JSON if structured
      allowNull: true,
    });

    await queryInterface.addColumn("contractor_invitations", "minimum_hours", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("contractor_invitations", "bcc_email", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("contractor_invitations", "approval_type");
    await queryInterface.removeColumn("contractor_invitations", "inclusion_list");
    await queryInterface.removeColumn("contractor_invitations", "minimum_hours");
    await queryInterface.removeColumn("contractor_invitations", "bcc_email");
  },
};
