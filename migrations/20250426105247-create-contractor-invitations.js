'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contractor_invitations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      invited_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users', // or 'admins', depending on your actual table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // or 'CASCADE' if you want to delete invites when user is deleted
      },
      contractor_email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contractor_name: {
        type: Sequelize.STRING
      },
      invite_token: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'expired', 'revoked'),
        defaultValue: 'pending'
      },
      sent_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expires_at: {
        type: Sequelize.DATE
      },
      accepted_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contractor_invitations');
  }
};
