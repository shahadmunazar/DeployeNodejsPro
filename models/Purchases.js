'use strict';
module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define('Purchase', {
    vendor_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    po_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,  
    },
    invoice_date: {
      type: DataTypes.DATEONLY,  
      allowNull: false,
    },
    invoice_no: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATEONLY,  
      allowNull: false,
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10, 2),  
      allowNull: false,  
    },
    ownership_type: {
      type: DataTypes.ENUM('Self-Owned', 'Partner'),  
      allowNull: false, 
    },
  }, {
    tableName: 'Purchases',  
    timestamps: true,  
    underscored: true,  
  });

  // Add any associations if needed (e.g., with another model)
  // Purchase.associate = function(models) {
  //   Purchase.belongsTo(models.Vendor, { foreignKey: 'vendor_id' });
  // };

  return Purchase;
};
