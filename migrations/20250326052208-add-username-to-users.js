'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Add column without NOT NULL constraint
    await queryInterface.addColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: true, // Temporarily allow NULL
    });

    // Step 2: Set a default username for existing users
    await queryInterface.sequelize.query(
      "UPDATE users SET username = CONCAT('user_', id) WHERE username IS NULL;"
    );

    // Step 3: Alter column to enforce NOT NULL
    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Step 4: Add unique constraint
    await queryInterface.addConstraint('users', {
      fields: ['username'],
      type: 'unique',
      name: 'unique_username_constraint'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('users', 'unique_username_constraint');
    await queryInterface.removeColumn('users', 'username');
  }
};
