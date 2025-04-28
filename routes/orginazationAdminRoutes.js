// routes/organizationRoutes.js
const express = require("express");
const router = express.Router();

const {
  GetOrginazationDetails,
  OrginazationAdminLogout,
  SendIvitationLinkContractor,GetInviationLinksList,ResendInvitationEmail
} = require("../controllers/API/OrginazationAdminController/OrginazationControllerAdmin");

const { authenticateUser, authorizeRoles } = require("../middleware/auth");

const WithContractorAdminAndRole = (handler, role = "organization") => {
  return [authenticateUser, authorizeRoles(role), handler];
};

router.get("/admin-details", ...WithContractorAdminAndRole(GetOrginazationDetails));
router.post("/logout", ...WithContractorAdminAndRole(OrginazationAdminLogout));
router.post("/send-contract-invitation-link", ...WithContractorAdminAndRole(SendIvitationLinkContractor));
router.get("/get-all-invitation-link", ...WithContractorAdminAndRole(GetInviationLinksList));
router.post("/resend-email-to-invitation", ...WithContractorAdminAndRole(ResendInvitationEmail));

module.exports = router;
