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
      country_name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      country_code: {
        type: Sequelize.STRING(5),
        allowNull: false,
        unique: true
      },
      dialing_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      currency_code: {
        type: Sequelize.STRING(3),
        allowNull: true
      },
      currency_symbol: {
        type: Sequelize.STRING,
        allowNull: true
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      continent: {
        type: Sequelize.STRING,
        allowNull: true
      },
      flag_url: {
        type: Sequelize.STRING,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Countries');
  }
};
