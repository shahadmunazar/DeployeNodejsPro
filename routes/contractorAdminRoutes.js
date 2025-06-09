const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const router = require("./userRoutes");
const { Op } = require("sequelize");


const {GetContractorDetails,ContractorAdminLogout,SendIvitationLinkContractor} = require("../controllers/API/ContractorAdminController/UserProfileController")
const uploadFiles = require("../middleware/uploadOrganizationFiles");
const { SendIvitationLinkContractorWorker,getRecentContractorWorkers, GetInductionContractorWorkersList  } = require("../controllers/API/ContractorAdminController/ContractorWorkerController");
/**
 * Middleware wrapper to apply checkAuth and checkRole globally to routes.
 * @param {Function} handler - The route handler function.
 * @param {string} role - Role to check for access.
 * @returns {Function} - Middleware with checkAuth, checkRole, and the handler.
 */

//for SuperAdmin Define Authentication And Authorization Variable

const WithContractorAdminAndRole = (handler, role = "contractor_admin") => {
  return [authenticateUser, authorizeRoles(role), handler];
};

//new



router.get("/admin-details", ...WithContractorAdminAndRole(GetContractorDetails));
router.post("/logout", ...WithContractorAdminAndRole(ContractorAdminLogout));


router.post("/send-contract-invitation-link", ...WithContractorAdminAndRole(SendIvitationLinkContractor));

router.post("/contactor-worker-invitation", ...WithContractorAdminAndRole(SendIvitationLinkContractorWorker));
router.get("/recent-add-contractor-worker-invitation", ...WithContractorAdminAndRole(getRecentContractorWorkers));
router.get("/get-induction-contractor-workers-list", ...WithContractorAdminAndRole(GetInductionContractorWorkersList));

// Start For Routes SuperAdmin

module.exports = router;
