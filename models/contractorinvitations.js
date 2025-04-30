'use strict';
module.exports = (sequelize, DataTypes) => {
  const ContractorInvitation = sequelize.define('ContractorInvitation', {
    invited_by: {
      type: DataTypes.INTEGER,
      allowNull: true
      // You can define associations later to link this to the User model
    },
    contractor_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
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
      allowNull: true
    },
    invite_token: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'expired', 'revoked'),
      defaultValue: 'pending'
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'contractor_invitations',
    timestamps: true,
    paranoid: true // enables deletedAt (soft delete)
  });

  // Associations (optional)
  ContractorInvitation.associate = function(models) {
    ContractorInvitation.belongsTo(models.User, {
      foreignKey: 'invited_by',
      as: 'inviter'
    });
  };

  return ContractorInvitation;
};
