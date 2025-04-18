'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentHistory extends Model {
    static associate(models) {
      // Define associations here when needed
      
      // Example: link to subscription (if using OrganizationSubscribeUser)
      // PaymentHistory.belongsTo(models.OrganizationSubscribeUser, {
      //   foreignKey: 'subscription_id',
      //   as: 'subscription'
      // });

      // Who created the entry
      // PaymentHistory.belongsTo(models.User, {
      //   foreignKey: 'user_id',
      //   as: 'creator'
      // });

      // Who updated the payment
      // PaymentHistory.belongsTo(models.Admin, {
      //   foreignKey: 'updated_by',
      //   as: 'updatedBy'
      // });
    }
  }

  PaymentHistory.init({
    subscription_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    paid_amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    remaining_amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payment_mode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PaymentHistory',
    tableName: 'PaymentHistories',
    timestamps: true,
    paranoid: true,
    deletedAt: 'deletedAt', 
  });

  return PaymentHistory;
};
