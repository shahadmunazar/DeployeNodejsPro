'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('organizations', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // Make sure this matches your Users table name
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('organizations', 'plan_id', {
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
    await queryInterface.removeColumn('organizations', 'user_id');
    await queryInterface.removeColumn('organizations', 'plan_id');
  }
};
