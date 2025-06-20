'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AuditLogsContractorAdmin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AuditLogsContractorAdmin.init({
   contractor_id:{
      type: DataTypes.INTEGER,
      allowNull: false, // Assuming nullable since not specified as NOT NULL
      references: {
        model: "contractor_registration",
        key: "id",
      },
      onDelete: 'CASCADE', // Assuming you want to set to NULL if contractor is deleted
    },
    entity_type: DataTypes.STRING(20),
    entity_id: DataTypes.INTEGER,
    reviewer_id: {
          type: DataTypes.INTEGER,
          references: { model: "users", key: "id" },
        },
    reviewer_name: DataTypes.STRING,
    action: DataTypes.ENUM('sent', 'accepted', 'expired', 'uploaded', 'approved', 'rejected', 'resubmission_requested', 'acknowledged', 'finalized'),
    comments: DataTypes.TEXT,
     createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

  }, {
    sequelize,
    modelName: 'AuditLogsContractorAdmin',
    timestamps: true, // Keeps createdAt & updatedAt
    tableName: "audit_logs_contractor_admins",

  });
  return AuditLogsContractorAdmin;
};