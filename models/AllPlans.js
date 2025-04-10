'use strict';

module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true
    },
    user_limit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    billing_cycle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,  // The newly added 'status' field (active or inactive)
      allowNull: false,
      defaultValue: true, // Default value is set to true (active)
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: 'plans',
    timestamps: true,  // This will automatically handle createdAt and updatedAt
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    paranoid: true,  // Enable soft delete (paranoid mode)
    deletedAt: 'deletedAt',  // Tell Sequelize to use the deletedAt column for soft deletes
  });

  return Plan;
};
