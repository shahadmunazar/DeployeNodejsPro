const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const UserRole = require("../models/userrole");
const Role = require("../models/role");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    console.log(user);
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const userRoles = await UserRole.findAll({ where: { userId: user.id } });
    const roles = await Promise.all(userRoles.map(async (ur) => {
      const role = await Role.findByPk(ur.roleId);
      return role.name;
    }));
    const token = jwt.sign({ id: user.id, roles }, "your_secret_key", { expiresIn: "30d" });
    res.json({ message: "Login successful",status:200, token, user: { id: user.id, name: user.name, email: user.email, roles } });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


const getCurrentUser = async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, { attributes: ["id", "name", "email"] });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const userRoles = await UserRole.findAll({ where: { userId: user.id } });
      const roles = await Promise.all(
        userRoles.map(async (ur) => {
          const role = await Role.findByPk(ur.roleId);
          return role ? role.name : null;
        })
      );
      const filteredRoles = roles.filter((role) => role !== null);
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: filteredRoles,
          token: req.header("Authorization"),
        }, 
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };

module.exports = { login, getCurrentUser };
