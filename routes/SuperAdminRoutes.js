const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const router = require("./userRoutes");
const { Op } = require("sequelize");
const { GetAllEnquiry, GetEnquiryById, UpdateInquiry } = require("../controllers/API/EnquirySection/enquiryController");
const {
  SuperAdminProfile,
  GetAllRoles,
  CheckPingSessionActivity,
  ForgetPassword,
  UpdatePassword,
  SuperAdminLogout,
  SendEmailForgetPassword,
  UpdatePasswordBySuperAdmin,
  ProfileUpdate,
  ConfirmEmailChange,
  DashBoard,
  Activetwofa,GetStatusOfMultiFactor
} = require("../controllers/API/SuperAdminController/ProfileController");
const { CreateIndustry, SoftDeleteIndustry, UpdateIndustry, GetIndustryById, GetAllIndustries } = require("../controllers/API/SuperAdminController/IndustryController");
const { CreatePlans, GetPlans, GetPlanById, UpdatePlan, DeletePlan, TogglePlanStatus } = require("../controllers/API/SuperAdminController/PlansController");
const {
  CreateOrganization,
  GetAllOrganization,
  GetOrgnizationById,
  UpdateOrginzation,
  ManagmentOrginazation,
  GetUserSubscriptionList,
  UpdateSubscriber,
  GetActivityLogDetails,
  UpdatePlanStatus,
  ToogleStatus,
  GetOrginazationDetails,
} = require("../controllers/API/SuperAdminController/OrganizationController");
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

router.post("/create-organization", uploadFiles, ...WithSuperAdminAndRole(CreateOrganization));
router.get("/get-organization", ...WithSuperAdminAndRole(GetAllOrganization));
router.get("/get-organization-by-id/:id", ...WithSuperAdminAndRole(GetOrgnizationById));
router.put("/update-organization/:id", uploadFiles, ...WithSuperAdminAndRole(UpdateOrginzation));

router.get("/managment-orginzation", ...WithSuperAdminAndRole(ManagmentOrginazation));
router.get("/get-orginazation-subscription-details/:id", ...WithSuperAdminAndRole(GetOrginazationDetails));
router.put("/toggle-status-managment/:id", ...WithSuperAdminAndRole(ToogleStatus));

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

router.put("/update-password-by-superadmin", ...WithSuperAdminAndRole(UpdatePasswordBySuperAdmin));
router.put("/profile-update", ...WithSuperAdminAndRole(ProfileUpdate));
router.get("/get-dashboard", ...WithSuperAdminAndRole(DashBoard));
router.post("/send-email-changed", ...WithSuperAdminAndRole(SendEmailForgetPassword));
router.put("/confirm-email-changed", ...WithSuperAdminAndRole(ConfirmEmailChange));
router.put("/active-multi-factor", ...WithSuperAdminAndRole(Activetwofa));
router.get("/get-status-of-multifactor", ...WithSuperAdminAndRole(GetStatusOfMultiFactor));
router.post("/superadmin-logout", ...WithSuperAdminAndRole(SuperAdminLogout));

//Create For Plan's

//Subscription List

router.get("/get-subscription-user-list", ...WithSuperAdminAndRole(GetUserSubscriptionList));
router.put("/update-subsciption-user-plans", ...WithSuperAdminAndRole(UpdateSubscriber));
router.get("/get-subscriber-activity-logs", ...WithSuperAdminAndRole(GetActivityLogDetails));

router.put("/update-payment-status", ...WithSuperAdminAndRole(UpdatePlanStatus));

router.post("/create-plans", ...WithSuperAdminAndRole(CreatePlans));
router.get("/plans", ...WithSuperAdminAndRole(GetPlans));
router.get("/plans/:id", ...WithSuperAdminAndRole(GetPlanById));
router.put("/update-plans/:id", ...WithSuperAdminAndRole(UpdatePlan));
router.delete("/plans/:id", ...WithSuperAdminAndRole(DeletePlan));
router.put("/toggle-plan-status/:id", ...WithSuperAdminAndRole(TogglePlanStatus));

//Enquiry Routes Start
router.get("/get-all-enquiry", ...WithSuperAdminAndRole(GetAllEnquiry));
router.get("/get-enquiry-by-id/:id", ...WithSuperAdminAndRole(GetEnquiryById));
router.put("/update-inquiry-by-id/:id", ...WithSuperAdminAndRole(UpdateInquiry));

router.get("/all-roles", ...WithSuperAdminAndRole(GetAllRoles));

// Start For Routes SuperAdmin

module.exports = router;
