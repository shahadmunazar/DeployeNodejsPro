'use strict';

module.exports = (sequelize, DataTypes) => {
  const SubscriberActivityLog = sequelize.define('SubscriberActivityLog', {
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    organizationName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    oldPlan: {
      type: DataTypes.STRING
    },
    newPlan: {
      type: DataTypes.STRING
    },
    effectiveDate: {
      type: DataTypes.DATE
    },
    statusBefore: {
      type: DataTypes.STRING
    },
    statusAfter: {
      type: DataTypes.STRING
    },
    reason: {
      type: DataTypes.TEXT
    },
    performedByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    performedByAdminName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subscriptionId:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    notificationSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'subscriber_activity_logs',
    timestamps: true,
    paranoid: true
  });

  return SubscriberActivityLog;
};
