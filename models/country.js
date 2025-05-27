'use strict';
module.exports = (sequelize, DataTypes) => {
  const Country = sequelize.define(
    'Country',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      iso2: {
        type: DataTypes.STRING(2),
        allowNull: false,
        unique: true
      },
      iso3: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true
      },
      numeric_code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phonecode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      capital: {
        type: DataTypes.STRING,
        allowNull: true
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: true
      },
      currency_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      currency_symbol: {
        type: DataTypes.STRING,
        allowNull: true
      },
      tld: {
        type: DataTypes.STRING,
        allowNull: true
      },
      native: {
        type: DataTypes.STRING,
        allowNull: true
      },
      region: {
        type: DataTypes.STRING,
        allowNull: true
      },
      region_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      subregion: {
        type: DataTypes.STRING,
        allowNull: true
      },
      subregion_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      nationality: {
        type: DataTypes.STRING,
        allowNull: true
      },
      latitude: {
        type: DataTypes.STRING,
        allowNull: true
      },
      longitude: {
        type: DataTypes.STRING,
        allowNull: true
      },
      emoji: {
        type: DataTypes.STRING,
        allowNull: true
      },
      emojiU: {
        type: DataTypes.STRING,
        allowNull: true
      },
      translations: {
        type: DataTypes.JSON,
        allowNull: true
      },
      timezones: {
        type: DataTypes.JSON,
        allowNull: true
      },
      status: {
        type: DataTypes.BOOLEAN,
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
      tableName: 'countries',
      timestamps: true,
      paranoid: true
    }
  );

  Country.associate = (models) => {
    Country.hasMany(models.State, {
      foreignKey: 'country_id',
      as: 'states'
    });
  };

  return Country;
};
