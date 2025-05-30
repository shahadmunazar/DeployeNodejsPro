'use strict';

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('in-app', 'email', 'sms', 'push'),
      defaultValue: 'in-app',
    },
    category: {
      type: DataTypes.ENUM('INVITE', 'ACTION', 'ALERT', 'SYSTEM', 'MESSAGE'),
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
      defaultValue: 'normal',
    },
    title: {
      type: DataTypes.STRING,
    },
    message: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('unread', 'read'),
      defaultValue: 'unread',
    },
    isSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    meta: {
      type: DataTypes.JSON,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'Notifications',
    timestamps: true,
  });

  // Optional: associations
  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
    Notification.belongsTo(models.User, { foreignKey: 'receiverId', as: 'receiver' });
  };

  return Notification;
};
