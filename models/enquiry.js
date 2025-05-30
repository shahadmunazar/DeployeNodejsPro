'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Enquiry extends Model {
    static associate(models) {
      // Define associations here if needed in future
    }
  }

  Enquiry.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userRole: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('New', 'In Progress', 'Resolved', 'Closed'),
      defaultValue: 'New'
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: true
    },
    assignedAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    assignedAdminName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true
    },
    activityLog: {
      type: DataTypes.JSON,
      allowNull: true
    },
    lead_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
  }, {
    sequelize,
    modelName: 'Enquiry',
    tableName: 'Enquiries',
    timestamps: true
  });

  return Enquiry;
};
