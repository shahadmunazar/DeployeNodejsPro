const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class UserRole extends Model {}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: { model: "Roles", key: "id" },
    },
  },
  { sequelize, modelName: "UserRole" }
);

module.exports = UserRole;
