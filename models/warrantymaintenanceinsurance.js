'use strict';
module.exports = (sequelize, DataTypes) => {
  const WarrantyMaintenanceInsurance = sequelize.define('WarrantyMaintenanceInsurance', {
    amc_vendor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    warranty_vendor: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    amc_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    amc_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    warranty_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    warranty_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    insurance_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    insurance_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'WarrantyMaintenanceInsurances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return WarrantyMaintenanceInsurance;
};
