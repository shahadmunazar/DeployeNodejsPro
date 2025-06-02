'use strict';

module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define(
    'Job',
    {
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'done', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'createdAt',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updatedAt',
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deletedAt',
      },
    },
    {
      tableName: 'jobs',
      timestamps: true,
      paranoid: true,
      underscored: false, 
    }
  );

  // If you want, you can define associations here later
  Job.associate = (models) => {
    // associations can be defined here if needed
  };

  return Job;
};
