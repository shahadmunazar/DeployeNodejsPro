'use strict';
const { Model, DataTypes } = require("sequelize");
// const bcrypt = require("bcrypt");
// const sequelize = require("../config/database");
module.exports = (sequelize, DataTypes) => {
  class AuditLogContractor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AuditLogContractor.init({
    contractor_id:{
      type: DataTypes.INTEGER,
      allowNull: false, // Assuming nullable since not specified as NOT NULL
      references: {
        model: "contractor_induction_registration",
        key: "id",
      },
      onDelete: 'CASCADE', // Assuming you want to set to NULL if contractor is deleted
    },
    entity_type: DataTypes.STRING(20),
    entity_id: DataTypes.BIGINT,
    reviewer_id: {
          type: DataTypes.INTEGER,
          references: { model: "users", key: "id" },
        },
    reviewer_name: DataTypes.STRING,
    action: DataTypes.ENUM('sent', 'accepted', 'expired', 'uploaded', 'approved', 'rejected', 'resubmission_requested', 'acknowledged', 'finalized'),
    comments: DataTypes.TEXT,
    contractor_type: DataTypes.ENUM('contractor_admin', 'contractor'),
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
    modelName: 'AuditLogContractor',
    //  sequelize,
    tableName: "audit_logs_contractors",
    // modelName: "User",
    // paranoid: true, // Enables Soft Delete (keeps deletedAt)
    timestamps: true, // Keeps createdAt & updatedAt
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });
  return AuditLogContractor;
};