const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const router = require("./userRoutes");

const { SuperAdminProfile,GetAllRoles, CheckPingSessionActivity, ForgetPassword, UpdatePassword } = require("../controllers/API/SuperAdminController/ProfileController");
const { CreateIndustry, SoftDeleteIndustry, UpdateIndustry, GetIndustryById, GetAllIndustries } = require("../controllers/API/SuperAdminController/IndustryController");
const { CreatePlans, GetPlans, GetPlanById, UpdatePlan, DeletePlan, TogglePlanStatus } = require("../controllers/API/SuperAdminController/PlansController");
const { CreateOrganization } = require("../controllers/API/SuperAdminController/OrganizationController");
const uploadFiles = require("../middleware/uploadOrganizationFiles");
/**
 * Middleware wrapper to apply checkAuth and checkRole globally to routes.
 * @param {Function} handler - The route handler function.
 * @param {string} role - Role to check for access.
 * @returns {Function} - Middleware with checkAuth, checkRole, and the handler.
 */

//for SuperAdmin Define Authentication And Authorization Variable

const WithSuperAdminAndRole = (handler, role = "superadmin") => {
  return [authenticateUser, authorizeRoles(role), handler];
};


router.post("/create-organization", uploadFiles,...WithSuperAdminAndRole(CreateOrganization));


router.get("/super-admin-profile", ...WithSuperAdminAndRole(SuperAdminProfile));
router.put("/check-ping-session", ...WithSuperAdminAndRole(CheckPingSessionActivity));

router.post("/forget-password", ...WithSuperAdminAndRole(ForgetPassword));
router.post("/update-password", ...WithSuperAdminAndRole(UpdatePassword));

//Create For Industry

router.post("/create-industry", ...WithSuperAdminAndRole(CreateIndustry));
router.get("/industries", ...WithSuperAdminAndRole(GetAllIndustries));
router.get("/industries/:id", ...WithSuperAdminAndRole(GetIndustryById));
router.put("/industries/:id", ...WithSuperAdminAndRole(UpdateIndustry));
router.delete("/industries/:id", ...WithSuperAdminAndRole(SoftDeleteIndustry));

//Create For Plan's

router.post("/create-plans", ...WithSuperAdminAndRole(CreatePlans));
router.get("/plans", ...WithSuperAdminAndRole(GetPlans));
router.get("/plans/:id", ...WithSuperAdminAndRole(GetPlanById));
router.put("/update-plans/:id", ...WithSuperAdminAndRole(UpdatePlan));
router.delete("/plans/:id", ...WithSuperAdminAndRole(DeletePlan));
router.put("/plans/:id/toggle-status", ...WithSuperAdminAndRole(TogglePlanStatus));


router.get("/all-roles", ...WithSuperAdminAndRole(GetAllRoles));

// Start For Routes SuperAdmin


module.exports = router;
