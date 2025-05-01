const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const router = require("./userRoutes");
const { Op } = require("sequelize");


const {GetContractorDetails,ContractorAdminLogout,SendIvitationLinkContractor} = require("../controllers/API/ContractorAdminController/UserProfileController")
const uploadFiles = require("../middleware/uploadOrganizationFiles");
/**
 * Middleware wrapper to apply checkAuth and checkRole globally to routes.
 * @param {Function} handler - The route handler function.
 * @param {string} role - Role to check for access.
 * @returns {Function} - Middleware with checkAuth, checkRole, and the handler.
 */

//for SuperAdmin Define Authentication And Authorization Variable

const WithContractorAdminAndRole = (handler, role = "contractor") => {
  return [authenticateUser, authorizeRoles(role), handler];
};





router.get("/admin-details", ...WithContractorAdminAndRole(GetContractorDetails));
router.post("/logout", ...WithContractorAdminAndRole(ContractorAdminLogout));


router.post("/send-contract-invitation-link", ...WithContractorAdminAndRole(SendIvitationLinkContractor));


// Start For Routes SuperAdmin

module.exports = router;
