module.exports = (sequelize, DataTypes) => {
  const OrganizationSubscribeUser = sequelize.define('OrganizationSubscribeUser', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Assuming this is the table name for User model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    org_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    payment_status: {
  type: DataTypes.ENUM('Paid', 'Due', 'Overdue'),
  defaultValue: 'Due',
  allowNull: false,
},
renewal_date: {
  type: DataTypes.DATE,
  allowNull: true,
},
subscription_status: {
  type: DataTypes.ENUM('Active', 'Expired', 'Canceled'),
  defaultValue: 'Active',
  allowNull: false,
},

    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'plans', // Assuming this is the table name for Plan model
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    validity_start_date: DataTypes.DATE,
    validity_end_date: DataTypes.DATE,
  }, {
    tableName: 'organization_subscribeuser',
    timestamps: true,
    paranoid: true
  });

  // Step Associations go here
  OrganizationSubscribeUser.associate = (models) => {
    // Association to Organization (backlink from OrganizationSubscribeUser to Organization)
    OrganizationSubscribeUser.belongsTo(models.Organization, {
      foreignKey: 'org_id',
      as: 'organization',
    });

    // Other associations
    OrganizationSubscribeUser.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    OrganizationSubscribeUser.belongsTo(models.Plan, {
      foreignKey: 'plan_id',
      as: 'plan',
    });
  };

  return OrganizationSubscribeUser;
};
