// models/purchase.js

'use strict';

module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define('Purchase', {
    vendor_name: {
      type: DataTypes.STRING(255),
      allowNull: false,  // Vendor name is required
    },
    po_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,  // PO Number must be unique
    },
    invoice_date: {
      type: DataTypes.DATEONLY,  // Use DATEONLY for Date format (yyyy-mm-dd)
      allowNull: false,  // Invoice date is required
    },
    invoice_no: {
      type: DataTypes.STRING(100),
      allowNull: false,  // Invoice number is required
    },
    purchase_date: {
      type: DataTypes.DATEONLY,  // Use DATEONLY for Date format (yyyy-mm-dd)
      allowNull: false,  // Purchase date is required
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),  // Decimal type with 2 decimal places
      allowNull: false,  // Purchase price is required
    },
    ownership_type: {
      type: DataTypes.ENUM('Self-Owned', 'Partner'),  // Enum type for ownership
      allowNull: false,  // Ownership type is required
    },
  }, {
    tableName: 'Purchases',  // Ensure table name is plural and matches your DB
    timestamps: true,  // Automatically creates `created_at` and `updated_at` fields
    underscored: true,  // Use snake_case for column names (e.g., created_at)
  });

  // Add any associations if needed (e.g., with another model)
  // Purchase.associate = function(models) {
  //   Purchase.belongsTo(models.Vendor, { foreignKey: 'vendor_id' });
  // };

  return Purchase;
};
