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
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // true means active, false means deleted
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Foreign key to Asset table
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assets',  // Reference to the 'assets' table
        key: 'id',  // Reference to the 'id' column of the 'assets' table
      },
      onDelete: 'CASCADE', // If an asset is deleted, the associated warranty/maintenance record will also be deleted
    },
  }, {
    tableName: 'WarrantyMaintenanceInsurances',
    timestamps: true,
    paranoid: true,    // Enable soft delete by tracking `deletedAt`
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  // Define the relationship with the Asset model
  WarrantyMaintenanceInsurance.associate = function (models) {
    // A WarrantyMaintenanceInsurance belongs to an Asset
    WarrantyMaintenanceInsurance.belongsTo(models.Asset, {
      foreignKey: 'asset_id',  // foreign key in this model
      onDelete: 'CASCADE',  // If the asset is deleted, delete the associated warranty maintenance insurance record
    });
  };

  return WarrantyMaintenanceInsurance;
};
