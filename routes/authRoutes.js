const express = require("express");
const { login, getCurrentUser, verifyOtp,LogoutFunction } = require("../controllers/authController");
const { ForgetPassword, UpdatePassword,GetLocation,SendEmailAgain } = require("../controllers/API/SuperAdminController/ProfileController");
const { SubmitEnquiry } = require("../controllers/API/EnquirySection/enquiryController");
const { authenticateUser } = require("../middleware/auth");
const {AddedAllCountry,getAllCountry,AddedAllStatesByCountry,AddedCitiesByStatesCountry,GetStatesbyCountry,GetCitySelectedState} = require("../controllers/API/OrginazationAdminController/tradetypeController");
const router = express.Router();


router.get('/get-location', GetLocation)
router.post("/login", login);
router.post("/send-email-to-orginazation-accept-inviation", SendEmailAgain);
router.post("/submit-enquiry", SubmitEnquiry);
router.post("/verify-otp", verifyOtp); // Step 2: Verify OTP & generate token
router.post("/forget-password", ForgetPassword);
router.post("/update-password", UpdatePassword);
router.get("/me", authenticateUser, getCurrentUser);
router.post("/logout-for-all",LogoutFunction)

router.post("/added-all-country",AddedAllCountry)
router.get("/get-all-countrys", getAllCountry);
router.post("/added-All-states-by-country", AddedAllStatesByCountry);
router.get("/get-states-by-country",GetStatesbyCountry)
router.get("/get-city-selected-states-by-id",GetCitySelectedState);
router.post("/added-cities-by-states-country", AddedCitiesByStatesCountry)

module.exports = router;
