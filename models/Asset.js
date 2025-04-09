'use strict';

module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    asset_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    asset_image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    asset_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    cwip_invoice_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('In Use', 'In Stock', 'Out for Repair'),
      allowNull: false,
      defaultValue: 'In Stock',
    },
    condition: {
      type: DataTypes.ENUM('New', 'Good', 'Damaged', 'Poor'),
      allowNull: false,
      defaultValue: 'New',
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    linked_asset: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    upload_files: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    po_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    invoice_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    self_owned_or_partner: {
      type: DataTypes.ENUM('Self-Owned', 'Partner'),
      allowNull: false,
      defaultValue: 'Self-Owned',
    },
    capitalization_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    end_of_life: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    capitalization_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    depreciation_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    accumulated_depreciation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    scrap_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    income_tax_depreciation_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    transferred_to: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    allotted_up_to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    amc_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    amc_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    warranty_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    warranty_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    insurance_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    insurance_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    effective_life: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Assuming there is a 'users' table
        key: 'id',
      },
      onDelete: 'SET NULL', // If the user is deleted, set to NULL
    },
    transfer_to_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users', // Reference to the 'users' table for transfer
        key: 'id',
      },
      onDelete: 'SET NULL', // If the user is deleted, set to NULL
    }
  }, {
    tableName: 'assets',
    timestamps: true,
    paranoid: true, // Enable soft delete
  });

  // Relationships
  Asset.associate = (models) => {
    // Foreign key relations
    Asset.belongsTo(models.AssetCategory, {
      foreignKey: 'category_id',
      onDelete: 'CASCADE', // Cascade delete if the category is deleted
    });

    Asset.belongsTo(models.Brand, {
      foreignKey: 'brand_id',
      onDelete: 'CASCADE', // Cascade delete if the brand is deleted
    });

    Asset.belongsTo(models.Vendor, {
      foreignKey: 'vendor_id',
      onDelete: 'SET NULL', // Set to NULL if the vendor is deleted
    });

    Asset.belongsTo(models.FinancialInformation, {
      foreignKey: 'finacial_info_id',
      onDelete: 'SET NULL', // Set to NULL if the financial info is deleted
    });

    Asset.belongsTo(models.Purchase, {
      foreignKey: 'purchases_id',
      onDelete: 'SET NULL', // Set to NULL if the purchase is deleted
    });

    Asset.belongsTo(models.Department, {
      foreignKey: 'department_id',
      onDelete: 'SET NULL', // Set to NULL if the department is deleted
    });

    Asset.belongsTo(models.WarrantyMaintenanceInsurance, {
      foreignKey: 'warranty_vendor_id',
      onDelete: 'SET NULL', // Set to NULL if the warranty vendor is deleted
    });

    Asset.belongsTo(models.User, {
      foreignKey: 'user_id', // Track the asset owner
      onDelete: 'SET NULL', // Set to NULL if the user is deleted
    });

    Asset.belongsTo(models.User, {
      foreignKey: 'transfer_to_id', // Track the user to whom the asset is transferred
      onDelete: 'SET NULL', // Set to NULL if the user is deleted
    });

    // One-to-many relationship: Assets can have many asset transfers
    Asset.hasMany(models.AssetTransfer, {
      foreignKey: 'asset_id',
      onDelete: 'SET NULL', // Set to NULL if the transfer is deleted
    });
  };

  return Asset;
};
