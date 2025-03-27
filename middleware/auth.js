const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token is required" ,status:401});
    }
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, "your_secret_key");
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found, Unauthorized" });
    }
    req.user = { id: user.id, name: user.name, email: user.email, roles: decoded.roles };
    console.log("user request",req.user);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired",status:401 });
  }
};


const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      console.log(req.user);
      if (!req.user || !Array.isArray(req.user.roles)) {
        return res.status(403).json({ message: "Access Denied!",status:401 });
      }
  
      const hasRole = req.user.roles.some(role => roles.includes(role));  
      if (!hasRole) {
        return res.status(403).json({ message: "Access Denied!",status:401 });
      }
  
      next();
    };
  };
  

module.exports = { authenticateUser, authorizeRoles };
