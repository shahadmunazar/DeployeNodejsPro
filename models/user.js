const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");

class User extends Model {
  async validatePassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, allowNull: true, unique: true },
    username: { type: DataTypes.STRING, allowNull: true, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: true },
    otpExpiresAt: { type: DataTypes.DATE, allowNull: true },
    loginAttemptCount: {type: DataTypes.INTEGER,allowNull: false,defaultValue: 0,
    },
    user_status: {type: DataTypes.ENUM("active", "locked"),allowNull: false,defaultValue: "active",
    },
  },
  { sequelize, modelName: "User" }
);

// Hash password before saving
User.beforeCreate(async user => {
  user.password = await bcrypt.hash(user.password, 10);
});

module.exports = User;
