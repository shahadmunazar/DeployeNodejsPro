'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrganizationSubscribeUser = sequelize.define('OrganizationSubscribeUser', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Should match the actual table name in DB
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'organizations', // Should match your organizations table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plans', // Make sure this matches your plans table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    validity_start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validity_end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'createdAt'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updatedAt'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deletedAt'
      }
  }, {
    tableName: 'organization_subscribeuser', // Explicit table name
    timestamps: true,   // Adds created_at and updated_at
    paranoid: true      // Adds deleted_at for soft deletes
  });

  // Associations
  OrganizationSubscribeUser.associate = function(models) {
    OrganizationSubscribeUser.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    OrganizationSubscribeUser.belongsTo(models.Organization, {
      foreignKey: 'org_id',
      as: 'organization'
    });
    OrganizationSubscribeUser.belongsTo(models.Plan, {
      foreignKey: 'plan_id',
      as: 'plan'
    });
  };

  return OrganizationSubscribeUser;
};
