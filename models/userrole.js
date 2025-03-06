const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class UserRole extends Model {}

UserRole.init(
  {
    userId: DataTypes.INTEGER,
    roleId: DataTypes.INTEGER,
  },
  { sequelize, modelName: "UserRole" }
);

module.exports = UserRole;
