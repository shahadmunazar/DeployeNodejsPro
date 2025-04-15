const express = require("express");
const { login, getCurrentUser, verifyOtp } = require("../controllers/authController");

const {SubmitEnquiry} = require("../controllers/API/EnquirySection/enquiryController");
const { authenticateUser } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/submit-enquiry",SubmitEnquiry);
router.post("/verify-otp", verifyOtp); // Step 2: Verify OTP & generate token

router.get("/me", authenticateUser, getCurrentUser);

module.exports = router;
