const express = require("express");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const { getCurrentUser, CreateAdminLogout, GetUserProfile } = require("../controllers/authController");
const { CreateRoles, GetAllRoles, GetRoleById, CreateAdmin, UpdateRoles } = require("../controllers/SuperAdmin/rolesController");
const router = express.Router();

const { CreateCategory, GetAllCategory, GetCategoryById, UpdateCategory, StatusUpdate, CategoryDelete } = require("../controllers/SuperAdmin/CategoryController");

const {CreateDepartment,GetDepartmentList,GetDepartmentListById,UpdateDepartment,DeleteDepartment,UpdateDepartmentStatus} = require("../controllers/SuperAdmin/Assets/DepartmentController")

const {CreateBrands,GetBrandsList,GetBrandsListById,UpdateBrands,DeleteBrands,UpdateBrandsStatus} = require("../controllers/SuperAdmin/Assets/BrandController")

const {
  GetAllUsersToken,
  exportAllUsers,
  CreateUserLogin,
  GetAllUsersWithRoles,
  GetuserById,
  UpdateUsers,
  DeleteUser,
  GetAllRolesListing,
  SnedInvitationLink,
  UpdateUsersStatus,
} = require("../controllers/SuperAdmin/AdminCreationcontroller");

const {
  CreateFinancial,
  GetFinancialList,
  GetFinancialListById,
  UpdateFinancial,
  DeleteFinancial,
  UpdateFinancialStatus,
} = require("../controllers/SuperAdmin/Assets/FinancialController");
const {
  CreateWarranty,
  GetAllCategoryListing,
  GetWarrantyById,
  UpdateWarranty,
  DeleteWarranty,
  WarrantyStatusUpdate,
} = require("../controllers/SuperAdmin/Assets/WarrantyController");

const {CreateAsset} = require("../controllers/SuperAdmin/Assets/AssetController");
const {CreateVendor,GetVendorList,GetVendorListById,UpdateVendor,DeleteVendor,UpdateVendorStatus} = require("../controllers/SuperAdmin/Assets/VendorController");
/**
 * Middleware wrapper to apply checkAuth and checkRole globally to routes.
 * @param {Function} handler - The route handler function.
 * @param {string} role - Role to check for access.
 * @returns {Function} - Middleware with checkAuth, checkRole, and the handler.
 */
const withAuthAndRole = (handler, role = "admin") => [authenticateUser, authorizeRoles(role), handler];

router.post("/admin-logout", ...withAuthAndRole(CreateAdminLogout));

router.post("/create-new-user", ...withAuthAndRole(CreateUserLogin));
router.get("/get-user", ...withAuthAndRole(GetAllUsersWithRoles));
router.get("/get-user-profile", ...withAuthAndRole(GetUserProfile));
router.get("/get-user-by-id/:id", ...withAuthAndRole(GetuserById));
router.put("/update-user", ...withAuthAndRole(UpdateUsers));
router.delete("/delete-user", ...withAuthAndRole(DeleteUser));
router.get("/get-all-roles", ...withAuthAndRole(GetAllRolesListing));
router.post("/send-invitation-link", ...withAuthAndRole(SnedInvitationLink));
router.put("/update-user-status", ...withAuthAndRole(UpdateUsersStatus));
router.get("/check-all-users-token", ...withAuthAndRole(GetAllUsersToken));
router.get("/export-all-users-into-csv", ...withAuthAndRole(exportAllUsers));

//Crud For Category Added By Admin Only

//  Asset Routes Start
router.post("/create-asset", ...withAuthAndRole(CreateAsset));


// End Asset Routes Here

router.post("/create-category", ...withAuthAndRole(CreateCategory));
router.get("/get-category", ...withAuthAndRole(GetAllCategory));
router.get("/get-category-by-id/:id", ...withAuthAndRole(GetCategoryById));
router.put("/update-category/:id", ...withAuthAndRole(UpdateCategory));
router.put("/category-status-update", ...withAuthAndRole(StatusUpdate));
router.delete("/category-delete/:id", ...withAuthAndRole(CategoryDelete));

// make for routes for Admin
router.post("/create-warranty-asset", ...withAuthAndRole(CreateWarranty));
router.get("/get-warranty-asset-list", ...withAuthAndRole(GetAllCategoryListing));
router.get("/get-warranty-asset-list-by-id/:id", ...withAuthAndRole(GetWarrantyById));
router.put("/update-warranty-asset/:id", ...withAuthAndRole(UpdateWarranty));
router.delete("/delete-warranty/:id", ...withAuthAndRole(DeleteWarranty));
router.put("/warranty-status-update", ...withAuthAndRole(WarrantyStatusUpdate));

//make routes for Financial -information

router.post("/create-financial-asset", ...withAuthAndRole(CreateFinancial));
router.get("/get-all-financial-list-asset", ...withAuthAndRole(GetFinancialList));
router.get("/get-finacial-list-by-id/:id", ...withAuthAndRole(GetFinancialListById));
router.put("/update-finacial-asset/:id", ...withAuthAndRole(UpdateFinancial));
router.delete("/delete-financial-asset/:id", ...withAuthAndRole(DeleteFinancial));
router.put("/update-financial-status", ...withAuthAndRole(UpdateFinancialStatus));


// for brands Core Settings 
router.post("/create-brands-asset", ...withAuthAndRole(CreateBrands));
router.get("/get-all-brands-list-asset", ...withAuthAndRole(GetBrandsList));
router.get("/get-brands-list-by-id/:id", ...withAuthAndRole(GetBrandsListById));
router.put("/update-brands-asset/:id", ...withAuthAndRole(UpdateBrands));
router.delete("/delete-brands-asset/:id", ...withAuthAndRole(DeleteBrands));
router.put("/update-brands-status", ...withAuthAndRole(UpdateBrandsStatus));

// for department Core Settings
router.post("/create-department-asset", ...withAuthAndRole(CreateDepartment));
router.get("/get-all-department-list-asset", ...withAuthAndRole(GetDepartmentList));
router.get("/get-department-list-by-id/:id", ...withAuthAndRole(GetDepartmentListById));
router.put("/update-department-asset/:id", ...withAuthAndRole(UpdateDepartment));
router.delete("/delete-department-asset/:id", ...withAuthAndRole(DeleteDepartment));
router.put("/update-department-status", ...withAuthAndRole(UpdateDepartmentStatus));

//for vendor added 

router.post("/create-vendor-asset", ...withAuthAndRole(CreateVendor));
router.get("/get-all-vendor-list-asset", ...withAuthAndRole(GetVendorList));
router.get("/get-vendor-list-by-id/:id", ...withAuthAndRole(GetVendorListById));
router.put("/update-vendor-asset/:id", ...withAuthAndRole(UpdateVendor));
router.delete("/delete-vendor-asset/:id", ...withAuthAndRole(DeleteVendor));
router.put("/update-vendor-status", ...withAuthAndRole(UpdateVendorStatus));

//
// router.post('/rolse-create', ...withAuthAndRole(CreateRoles));
// // GetAllRoles
// router.get('/roles-get', ...withAuthAndRole(GetAllRoles));
// //GetRoleById
// router.get('/roles-details', ...withAuthAndRole(GetRoleById));
// router.post('/create-admins', ...withAuthAndRole(CreateAdmin));

router.get("/admin", authenticateUser, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

router.get("/user", authenticateUser, getCurrentUser);

router.get("/user", authenticateUser, authorizeRoles("user"), (req, res) => {
  res.json({ message: "Welcome User!" });
});

router.get("/manager", authenticateUser, authorizeRoles("manager"), (req, res) => {
  res.json({ message: "Welcome Manager!" });
});

// ✅ Officer Route
router.get("/officer", authenticateUser, authorizeRoles("officer"), (req, res) => {
  res.json({ message: "Welcome Officer!" });
});

// ✅ Technician Route
router.get("/technician", authenticateUser, authorizeRoles("technician"), (req, res) => {
  res.json({ message: "Welcome Technician!" });
});

// ✅ Compliance Route
router.get("/compliance", authenticateUser, authorizeRoles("compliance"), (req, res) => {
  res.json({ message: "Welcome Compliance Officer!" });
});

module.exports = router;
