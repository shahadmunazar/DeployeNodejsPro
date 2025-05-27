'use strict';
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define(
    'Country',
    {
      country_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      country_code: {
        type: DataTypes.STRING(5),
        allowNull: false,
        unique: true,
      },
      dialing_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency_code: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      currency_symbol: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      timezone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      continent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flag_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
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
      tableName: 'countries',
      timestamps: true,
      paranoid: true,
    }
  );

  Country.associate = (models) => {
    // define associations here if needed later
    // e.g. Country.hasMany(models.City);
  };

  return Country;
};
