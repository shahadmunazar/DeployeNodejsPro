const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Role extends Model {}

Role.init(
  {
    name: DataTypes.STRING,
  },
  { sequelize, modelName: "Role" }
);



module.exports = Role;
