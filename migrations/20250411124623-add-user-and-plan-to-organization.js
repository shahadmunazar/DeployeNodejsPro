'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Organizations', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // Make sure this matches your Users table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('Organizations', 'plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Plans', // Make sure this matches your Plans table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Organizations', 'user_id');
    await queryInterface.removeColumn('Organizations', 'plan_id');
  }
};
