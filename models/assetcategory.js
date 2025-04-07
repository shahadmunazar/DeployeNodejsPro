// models/AssetCategory.js

'use strict';

module.exports = (sequelize, DataTypes) => {
  const AssetCategory = sequelize.define('AssetCategory', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  }, {
    tableName: 'AssetCategories',
    timestamps: true,  // This will include `createdAt` and `updatedAt`
    paranoid: true,    // Enable soft delete by tracking `deletedAt`
  });

  AssetCategory.associate = function(models) {
    AssetCategory.hasMany(models.Asset, {
      foreignKey: 'category_id',
      as: 'assets',
    });
  };

  return AssetCategory;
};
