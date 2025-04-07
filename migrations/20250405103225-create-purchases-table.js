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
      type: DataTypes.DATEONLY,  // Date-only type for invoice date
      allowNull: false,  // Invoice date is required
    },
    invoice_no: {
      type: DataTypes.STRING(100),
      allowNull: false,  // Invoice number is required
    },
    purchase_date: {
      type: DataTypes.DATEONLY,  // Date-only type for purchase date
      allowNull: false,  // Purchase date is required
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),  // Numeric type with 2 decimal places
      allowNull: false,  // Purchase price is required
    },
    ownership_type: {
      type: DataTypes.ENUM('Self-Owned', 'Partner'),  // Enum with two options
      allowNull: false,  // Ownership type is required
    },
  }, {
    tableName: 'Purchases',  // Table name in the database
    timestamps: true,  // Automatically creates created_at and updated_at columns
    underscored: true,  // Use snake_case for column names (e.g., created_at)
  });

  return Purchase;
};
