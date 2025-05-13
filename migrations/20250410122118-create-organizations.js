'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the Organizations table with a foreign key to Industries
    await queryInterface.createTable('Organizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      organization_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      industryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Industries',  // Name of the table to reference
          key: 'id',             // The column to reference in the Industries table
        },
        onUpdate: 'CASCADE',      // Update organization when industry is updated
        onDelete: 'SET NULL',     // Set industryId to NULL if industry is deleted
      },

      organization_address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      postal_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      registration_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      contact_phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      number_of_employees: {
        type: Sequelize.ENUM('1-10', '11-50', '51-200', '201-500', '500+'),
        allowNull: true,
      },

      logo: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      agreement_paper: {
        type: Sequelize.STRING,
        allowNull: true,
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
        allowNull: true,
        comment: 'Timestamp for soft delete'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Dropping the Organizations table in case we need to revert the migration
    await queryInterface.dropTable('Organizations');
  }
};
