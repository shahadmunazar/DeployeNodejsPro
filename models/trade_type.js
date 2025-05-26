'use strict';

module.exports = (sequelize, DataTypes) => {
  const TradeType = sequelize.define(
    'TradeType',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'trade_types',
      timestamps: true,
      paranoid: true, 
    }
  );

  TradeType.associate = (models) => {
    // Define associations here if needed in future
    // Example: TradeType.hasMany(models.SomeModel, { foreignKey: 'trade_type_id' });
  };

  return TradeType;
};
