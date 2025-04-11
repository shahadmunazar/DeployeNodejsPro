'use strict';
module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    organization_name: DataTypes.STRING,
    industryId: DataTypes.INTEGER,
    organization_address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    registration_id: DataTypes.STRING,
    contact_phone_number: DataTypes.STRING,
    number_of_employees: DataTypes.STRING,
    logo: DataTypes.STRING,
    agreement_paper: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    plan_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  }, {
    tableName: 'organizations',
    timestamps: true,
    paranoid: true
  });

  // ✅ Associations should be defined here
  Organization.associate = (models) => {
    Organization.hasMany(models.OrganizationSubscribeUser, {
      foreignKey: 'org_id',
      as: 'subscribers'
    });

    Organization.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    Organization.belongsTo(models.Plan, {
      foreignKey: 'plan_id',
      as: 'plan'
    });
    Organization.belongsTo(models.Industry, {
        foreignKey: 'industryId',
        as: 'industry'
      });
  };

  return Organization;
};
