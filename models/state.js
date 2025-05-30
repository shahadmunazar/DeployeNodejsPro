'use strict';

module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define(
    'State',
    {
      state_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      state_code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true
      },
      country_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'states',
      timestamps: true,
      paranoid: true
    }
  );

 State.associate = (models) => {
  State.belongsTo(models.Country, {
    foreignKey: 'country_id',
    as: 'country'
  });
};


  return State;
};
