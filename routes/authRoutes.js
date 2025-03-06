const express = require("express");
const { login, getCurrentUser } = require("../controllers/authController");
const { authenticateUser } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.get("/me", authenticateUser, getCurrentUser);

module.exports = router;
