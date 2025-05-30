'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('in-app', 'email', 'sms', 'push'),
        defaultValue: 'in-app',
      },
      category: {
        type: Sequelize.ENUM('INVITE', 'ACTION', 'ALERT', 'SYSTEM', 'MESSAGE'),
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'critical'),
        defaultValue: 'normal',
      },
      title: {
        type: Sequelize.STRING,
      },
      message: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM('unread', 'read'),
        defaultValue: 'unread',
      },
      isSeen: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      meta: {
        type: Sequelize.JSON,
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop ENUMs before dropping table to avoid type conflicts
    await queryInterface.dropTable('Notifications');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Notifications_type"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Notifications_category"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Notifications_priority"`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_Notifications_status"`);
  }
};
