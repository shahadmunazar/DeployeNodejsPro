// routes/organizationRoutes.js
const express = require("express");
const router = express.Router();

const {
  GetOrginazationDetails,
  OrginazationAdminLogout,
  SendIvitationLinkContractor,
  GetInviationLinksList,
  ResendInvitationEmail,
  handleContractorTokenInvitation,
  SendverificationCode,
  VerifyMultifactorAuth,
  GetDetailsInvitationDetails,
  UpdateContractorComments,
  UpdateSubmissionStatus
} = require("../controllers/API/OrginazationAdminController/OrginazationControllerAdmin");
const {
  CreateContractorRegistration,
  UploadInsuranceContrator,
  UploadPublicLiability,
  UploadSafetyMNContractor,
  GetInsuranceContractor,
  GetPublicLiabilityContractor,
  GetSafetyMangmentContractor,
  DeleteInsuranceContrator,
  DeletePublicLContrator,
  DeleteSafetyMContrator,
  CheckContractorRegisterStatus,
  DeleteContractorRecords,
  GetContractorDetails,
  MakePdfToAllContractorForm
  
} = require("../controllers/API/ContractorAdminController/RegistrationContractorController");

// const {TestingRoute} = require('../controllers/testingController')

const { authenticateUser, authorizeRoles } = require("../middleware/auth");

const WithOrginazationAdminAndRole = (handler, role = "organization") => {
  return [authenticateUser, authorizeRoles(role), handler];
};

const uploadFiles = require("../middleware/uploadOrganizationFiles");

router.post("/send-multifactor-verification", SendverificationCode);
router.post("/verify-multifactor-authentication", VerifyMultifactorAuth);

router.post("/create-registration-contractor", CreateContractorRegistration);

router.post("/upload-insurace-contractor", uploadFiles, UploadInsuranceContrator);
router.post("/upload-public-liability", uploadFiles, UploadPublicLiability);
router.post("/upload-safety-managment", uploadFiles, UploadSafetyMNContractor);

router.get("/get-insurance-contractor", GetInsuranceContractor);
router.get("/get-public-liability-contractor", GetPublicLiabilityContractor);
router.get("/get-safety-managment-contractor", GetSafetyMangmentContractor);

router.get("/get-details-of-contructor", GetContractorDetails)

router.delete("/delete-insurance-contractor", DeleteInsuranceContrator);
router.delete("/public-liability-contractor", DeletePublicLContrator);
router.delete("/delete-safety-managment-contractor", DeleteSafetyMContrator);
router.get("/check-contractor-register", CheckContractorRegisterStatus);
router.delete("/delete-contractor-records",DeleteContractorRecords);



router.get("/admin-details", ...WithOrginazationAdminAndRole(GetOrginazationDetails));
router.post("/logout", ...WithOrginazationAdminAndRole(OrginazationAdminLogout));
router.post("/send-contract-invitation-link", ...WithOrginazationAdminAndRole(SendIvitationLinkContractor));
router.get("/get-all-invitation-link", ...WithOrginazationAdminAndRole(GetInviationLinksList));
router.get("/get-details-of-invitation", ...WithOrginazationAdminAndRole(GetDetailsInvitationDetails));
router.post("/update-comments-of-contructor", ...WithOrginazationAdminAndRole(UpdateContractorComments));
router.put("/update-submission-status",...WithOrginazationAdminAndRole(UpdateSubmissionStatus));
router.post("/resend-email-to-invitation", ...WithOrginazationAdminAndRole(ResendInvitationEmail));
// router.post("/make-pdf-to-contractor-form", ...WithOrginazationAdminAndRole(MakePdfToAllContractorForm));
router.post("/make-pdf-to-contractor-form",MakePdfToAllContractorForm);

router.get("/contractor/validate-invitation", handleContractorTokenInvitation);

// router.get("/testing-routes",TestingRoute );

module.exports = router;
