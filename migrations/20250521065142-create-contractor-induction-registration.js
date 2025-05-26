'use strict';

const { DATE } = require("sequelize");
const { all } = require("../routes/userRoutes");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('contractor_induction_registration', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        
      },
      email_otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobile_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mobile_otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      organization_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      user_image: {
        type: Sequelize.STRING,  // URL or filepath to image
        allowNull: true,
      },
      trade_type: {
  type: Sequelize.JSON, // or Sequelize.TEXT and stringify manually
  allowNull: true,
},
      email_otp_expired_at:{
        type: Sequelize.DATE,
        allowNull:true,
      },
      email_verified_at:{
        type: Sequelize.DATE,
        allowNull:true
      },
      mobile_verified_expired_at:{
        type: Sequelize.DATE,
        allowNull:true,
      },
      mobile_otp_verified_at:{
        type: Sequelize.DATE,
        allowNull:true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      status:{
         type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: true
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt:{
        allowNull: true,
        type: Sequelize.DATE,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('contractor_induction_registration');
  }
};
