const jwt = require("jsonwebtoken");
const User = require("../models/user");
const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const RefreshToken = require("../models/refreshToken")(sequelize, DataTypes);

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token is required", status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, "your_secret_key");
    console.log("Decoded JWT:", decoded);

    const storedToken = await RefreshToken.findOne({
      where: {
        userId: decoded.id,
        token: token,
        // isBlacklisted: false, // Optional: if you're blacklisting tokens
      },
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Token is invalid or logged out", status: 401 });
    }

    // Check if user exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found, Unauthorized" });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: decoded.roles || [],
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Token is invalid or expired", status: 401 });
  }
};


const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("Decoded user:", req.user);

    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(403).json({ message: "Access Denied!", status: 403 });
    }

    const hasRole = req.user.roles.some(role => roles.includes(role));
    console.log("Has required role?", hasRole);

    if (!hasRole) {
      return res.status(403).json({ message: "Access Denied!", status: 403 });
    }

    next();
  };
};

  

module.exports = { authenticateUser, authorizeRoles };
