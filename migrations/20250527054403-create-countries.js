'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Countries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      iso2: {
        type: Sequelize.STRING(2),
        allowNull: false,
        unique: true
      },
      iso3: {
        type: Sequelize.STRING(3),
        allowNull: false,
        unique: true
      },
      numeric_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phonecode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      capital: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency_symbol: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tld: {
        type: Sequelize.STRING,
        allowNull: true
      },
      native: {
        type: Sequelize.STRING,
        allowNull: true
      },
      region: {
        type: Sequelize.STRING,
        allowNull: true
      },
      region_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      subregion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      subregion_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: true
      },
      latitude: {
        type: Sequelize.STRING,
        allowNull: true
      },
      longitude: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emoji: {
        type: Sequelize.STRING,
        allowNull: true
      },
      emojiU: {
        type: Sequelize.STRING,
        allowNull: true
      },
      translations: {
        type: Sequelize.JSON,
        allowNull: true
      },
      timezones: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('Countries');
  }
};
