'use strict';

const { all } = require("../routes/userRoutes");

module.exports = (sequelize, DataTypes) => {
  const TradeTypeSelectDocument = sequelize.define(
    'TradeTypeSelectDocument',
    {
      trade_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      document_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      documents_filed_name:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      document_types_opt_man:{
        type: DataTypes.ENUM('optional', 'mandatory'),
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
      tableName: 'trade_type_select_documents',
      timestamps: true,
      paranoid: true,
    }
  );

  TradeTypeSelectDocument.associate = (models) => {
    TradeTypeSelectDocument.belongsTo(models.TradeType, {
      foreignKey: 'trade_type_id',
      as: 'tradeType',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return TradeTypeSelectDocument;
};
