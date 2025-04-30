// routes/organizationRoutes.js
const express = require("express");
const router = express.Router();

const {
  GetOrginazationDetails,
  OrginazationAdminLogout,
  SendIvitationLinkContractor,GetInviationLinksList,ResendInvitationEmail,handleContractorTokenInvitation,SendverificationCode,VerifyMultifactorAuth
} = require("../controllers/API/OrginazationAdminController/OrginazationControllerAdmin");

const { authenticateUser, authorizeRoles } = require("../middleware/auth");

const WithOrginazationAdminAndRole = (handler, role = "organization") => {
  return [authenticateUser, authorizeRoles(role), handler];
};

router.post("/send-multifactor-verification", SendverificationCode);
router.post("/verify-multifactor-authentication", VerifyMultifactorAuth)
router.get("/admin-details", ...WithOrginazationAdminAndRole(GetOrginazationDetails));
router.post("/logout", ...WithOrginazationAdminAndRole(OrginazationAdminLogout));
router.post("/send-contract-invitation-link", ...WithOrginazationAdminAndRole(SendIvitationLinkContractor));
router.get("/get-all-invitation-link", ...WithOrginazationAdminAndRole(GetInviationLinksList));
router.post("/resend-email-to-invitation", ...WithOrginazationAdminAndRole(ResendInvitationEmail));


router.get("/contractor/validate-invitation", handleContractorTokenInvitation);

module.exports = router;
