'use strict';

module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define(
    'City',
    {
      city_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      country_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      latitude: {
        type: DataTypes.STRING,
        allowNull: true
      },
      longitude: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'cities',
      timestamps: true,
      paranoid: true
    }
  );

  City.associate = (models) => {
    City.belongsTo(models.State, {
      foreignKey: 'state_id',
      as: 'state'
    });
    City.belongsTo(models.Country, {
      foreignKey: 'country_id',
      as: 'country'
    });
  };
  return City;
};
