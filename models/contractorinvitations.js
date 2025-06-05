"use strict";
module.exports = (sequelize, DataTypes) => {
  const ContractorInvitation = sequelize.define(
    "ContractorInvitation",
    {
      invited_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // You can define associations later to link this to the User model
      },
      send_status: {
        type: DataTypes.ENUM("sent", "failed", "pending", "resend"),
        allowNull: true,
        defaultValue: null,
      },
      contractor_email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      OneTimePass: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      contractor_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invite_token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "accepted", "expired", "revoked"),
        defaultValue: "pending",
      },
      sent_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      approval_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inclusion_list: {
        type: DataTypes.STRING, // Or DataTypes.JSON if structured
        allowNull: true,
      },
      minimum_hours: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      bcc_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invitation_type: {
        type: DataTypes.ENUM("contractor_invitation", "contractor_induction", "contractor_admin_induction", "contractor_user_induction", "staff", "compliance_manager"),
        allowNull: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      accepted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "contractor_invitations",
      timestamps: true,
      paranoid: true, // enables deletedAt (soft delete)
    }
  );

  // Associations (optional)
 ContractorInvitation.associate = function (models) {
    ContractorInvitation.belongsTo(models.User, {
      foreignKey: "invited_by",
      as: "inviter",
    });

    ContractorInvitation.hasMany(models.ContractorInductionRegistration, {
      foreignKey: "invited_by_organization",
      sourceKey: "invited_by",
      as: "contractors",
    });
  };

  return ContractorInvitation;
};
