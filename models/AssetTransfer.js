'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = (sequelize, DataTypes) => {
  const AssetTransfer = sequelize.define('AssetTransfer', {
    asset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from_department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,  // Could be null if not transferred yet or if asset is not assigned
      references: {
        model: 'departments',
        key: 'id',
      },
      onDelete: 'SET NULL',  // Set to NULL if the department is deleted
    },
    to_department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id',
      },
      onDelete: 'CASCADE',  // Cascade delete if department is deleted
    },
    transfer_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING(500),
      allowNull: true, // Optional field for remarks or any additional info
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'asset_transfers',
    timestamps: true,  // Ensures that `createdAt` and `updatedAt` fields are included
    paranoid: false,   // Soft delete is not applied here, as asset transfer records will be deleted permanently
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  });

  // Define associations
  AssetTransfer.associate = function(models) {
    // Association with the Asset model (if exists)
    AssetTransfer.belongsTo(models.Asset, {
      foreignKey: 'asset_id',
      as: 'asset',  // Alias for the associated asset
    });

    // Association with the Department model for the 'from' department
    AssetTransfer.belongsTo(models.Department, {
      foreignKey: 'from_department_id',
      as: 'fromDepartment', // Alias for the from department
    });

    // Association with the Department model for the 'to' department
    AssetTransfer.belongsTo(models.Department, {
      foreignKey: 'to_department_id',
      as: 'toDepartment', // Alias for the to department
    });
  };

  return AssetTransfer;
};
