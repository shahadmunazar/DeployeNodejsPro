"use strict";

const Documents = require('./contractor_document')
module.exports = (sequelize, DataTypes) => {
  const ContractorInductionRegistration = sequelize.define(
    "ContractorInductionRegistration",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      email_otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      mobile_otp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      organization_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trade_type: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      email_otp_expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      agree_terms: {
        type: DataTypes.ENUM("sent", "pending", "submit", "retrytoprocess", "failed"),
        defaultValue: "pending",
      },
      induction_status: {
      type: DataTypes.ENUM('approved', 'rejected', 'recheck', 'pending'),
      allowNull: true,
      defaultValue: 'pending'
    },
      mobile_verified_expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      mobile_otp_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invited_by_organization: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      confirm_mandatoryDocumentUpload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      confirm_optionalDocumentUpload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      mandatoryDocumentUpload: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      optionalDocumentUpload: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       induction_reg_type: {
        type: DataTypes.ENUM('contractor_admin', 'contractor'),
        allowNull: true, 
        defaultValue: 'contractor_admin', 
      },

      // police_check_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // covid_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // health_practitioner_registration_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // trade_qualification_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      // flu_vaccination_id: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "contractor_induction_registration",
      timestamps: true,
      paranoid: true,
    }
  );

 ContractorInductionRegistration.associate = (models) => {
  ContractorInductionRegistration.hasMany(models.ContractorDocument, {
    foreignKey: "contractor_reg_id",
    as: "documents",
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
};

  return ContractorInductionRegistration;
};