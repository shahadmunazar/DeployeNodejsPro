'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PaymentHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subscription_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      paid_amount: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      total_amount: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      remaining_amount: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      payment_status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      payment_mode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: true
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
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
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PaymentHistories');
  }
};
