'use strict';
module.exports = (sequelize, DataTypes) => {
  const BlacklistedToken = sequelize.define('BlacklistedToken', {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {});

  return BlacklistedToken;
};
