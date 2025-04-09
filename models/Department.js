'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true, // Ensures the department name is unique
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true, // Optional description field
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // True indicates active status
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true, // Soft delete functionality, allowing null
      defaultValue: null, // Default value is null
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Auto-generated timestamp
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Auto-generated timestamp for updates
    },
  }, {
    tableName: 'departments',
    timestamps: true, // Enables Sequelize's default timestamp fields
    paranoid: true, // Enables soft delete functionality using `deleted_at`
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  // You can add associations here (if needed)
  // Department.associate = function(models) {
  //   // Example: if a department has many assets
  //   Department.hasMany(models.Asset, {
  //     foreignKey: 'department_id',
  //     as: 'assets',
  //   });
  // };

  return Department;
};
