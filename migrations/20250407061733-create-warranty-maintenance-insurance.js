'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WarrantyMaintenanceInsurances', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      amc_vendor: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      warranty_vendor: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      amc_start_date: {
        type: Sequelize.DATEONLY, 
        allowNull: false,
      },
      amc_end_date: {
        type: Sequelize.DATEONLY,  
        allowNull: false,
      },
      warranty_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      warranty_end_date: {
        type: Sequelize.DATEONLY,  
        allowNull: false,  
      },
      insurance_start_date: {
        type: Sequelize.DATEONLY,  
        allowNull: false,  
      },
      insurance_end_date: {
        type: Sequelize.DATEONLY,  
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WarrantyMaintenanceInsurances');
  },
};
