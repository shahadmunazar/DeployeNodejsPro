'use strict';

module.exports = (sequelize, DataTypes) => {
  const Industry = sequelize.define('Industry', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    paranoid: true, 
    tableName: 'Industries',
  });

  Industry.associate = function(models) {
    // Define associations here
    // Example: Industry.hasMany(models.Organization, { foreignKey: 'industryId' });
  };

  return Industry;
};
