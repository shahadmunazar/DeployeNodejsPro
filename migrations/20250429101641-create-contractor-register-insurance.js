'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contractor_register_insurance', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contractor_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'contractor_registration',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      policy_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      coverage_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      document_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: { 
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contractor_register_insurance');
  },
};
