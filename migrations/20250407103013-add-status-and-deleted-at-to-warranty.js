module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('WarrantyMaintenanceInsurances', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('WarrantyMaintenanceInsurances', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('WarrantyMaintenanceInsurances', 'status');
    await queryInterface.removeColumn('WarrantyMaintenanceInsurances', 'deletedAt');
  }
};
