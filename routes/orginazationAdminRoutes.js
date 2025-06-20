const express = require("express");
const router = express.Router();
const {
  GetOrginazationDetails,
  OrginazationAdminLogout,
  SendIvitationLinkContractor,
  UpdateInvitationStatus,
  GetInviationLinksList,
  ResendInvitationEmail,
  handleContractorTokenInvitation,
  SendverificationCode,
  VerifyMultifactorAuth,
  GetDetailsInvitationDetails,
  UpdateContractorComments,
  UpdateSubmissionStatus,
  GetSubmissionPrequalification,
  getAllContractorAdmins,
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
  MakePdfToAllContractorForm,
  SearchLocation,
  SendInductionEmail,
  ChangeEmailRequest,
  UploadContractorCompanyDocument
} = require("../controllers/API/ContractorAdminController/RegistrationContractorController");
const { CreateTradeTypes, GetAllTradeTypes, TradeTypeDoucmentCreate, GetTradeTypeselectDocuments } = require("../controllers/API/OrginazationAdminController/tradetypeController");
const { GetSubmissionPrequalificationNotification } = require("../controllers/API/ContractorAdminController/NotificationController");
const {
  RegitserContractiorInducation,
  VerifyMobileAndEmail,
  ContractorRegistrationForm,
  UploadContractorDocuments,
  getAllTraderTpeUploadedDocuments,
  GetUploadedDocuments,
  AddedInductionContent,
  GetInductionContent,
  UploadContentInduction,
  GetInductionContractorPdf,
  GetAllInductionRegister,
  GetInvitationorgId,
  FetchPrequalification
} = require("../controllers/API/ContractorAdminController/InuctionRegisterController");

const {getAllDocumentContractor,updateDocumentApprovalStatus,GetAllDocumentsForWorker, ApprovedWorkerDocument} = require("../controllers/API/ContractorAdminController/ContractorDocsController");

// const {TestingRoute} = require('../controllers/testingController')
const {SendIvitationLinkContractorWorker} = require("../controllers/API/ContractorAdminController/ContractorWorkerController");
const { authenticateUser, authorizeRoles } = require("../middleware/auth");
const WithOrginazationAdminAndRole = (handler, role = "organization") => {
  return [authenticateUser, authorizeRoles(role), handler];
};
const uploadFiles = require("../middleware/uploadOrganizationFiles");
const UploadInductionDocuments = require("../middleware/inductioncontractor");
const { route } = require("./userRoutes");
router.post("/send-multifactor-verification", SendverificationCode);
router.post("/verify-multifactor-authentication", VerifyMultifactorAuth);
router.post("/create-registration-contractor", CreateContractorRegistration);
router.post("/upload-contractor-company-document", uploadFiles, UploadContractorCompanyDocument);
router.post("/upload-insurace-contractor", uploadFiles, UploadInsuranceContrator);
router.post("/upload-public-liability", uploadFiles, UploadPublicLiability);
router.post("/upload-safety-managment", uploadFiles, UploadSafetyMNContractor);
router.get("/get-insurance-contractor", GetInsuranceContractor);
router.get("/get-public-liability-contractor", GetPublicLiabilityContractor);
router.get("/get-safety-managment-contractor", GetSafetyMangmentContractor);
router.get("/get-details-of-contructor", GetContractorDetails);
router.delete("/delete-insurance-contractor", DeleteInsuranceContrator);
router.delete("/public-liability-contractor", DeletePublicLContrator);
router.delete("/delete-safety-managment-contractor", DeleteSafetyMContrator);
router.get("/check-contractor-register", CheckContractorRegisterStatus);
router.delete("/delete-contractor-records", DeleteContractorRecords);
router.get("/admin-details", ...WithOrginazationAdminAndRole(GetOrginazationDetails));
router.post("/logout", ...WithOrginazationAdminAndRole(OrginazationAdminLogout));
router.post("/send-contract-invitation-link", ...WithOrginazationAdminAndRole(SendIvitationLinkContractor));
router.put("/update-invitation-status", UpdateInvitationStatus);
router.get("/get-all-invitation-link", ...WithOrginazationAdminAndRole(GetInviationLinksList));
router.get("/get-details-of-invitation", ...WithOrginazationAdminAndRole(GetDetailsInvitationDetails));
router.post("/update-comments-of-contructor", ...WithOrginazationAdminAndRole(UpdateContractorComments));
router.put("/update-submission-status", ...WithOrginazationAdminAndRole(UpdateSubmissionStatus));
router.post("/resend-email-to-invitation", ...WithOrginazationAdminAndRole(ResendInvitationEmail));
// router.post("/make-pdf-to-contractor-form", ...WithOrginazationAdminAndRole(MakePdfToAllContractorForm));
router.post("/make-pdf-to-contractor-form", MakePdfToAllContractorForm);

router.post("/send-induction-email", ...WithOrginazationAdminAndRole(SendInductionEmail));
router.get("/get-all-submission-prequalification", ...WithOrginazationAdminAndRole(GetSubmissionPrequalification));
router.get("/contractor/validate-invitation", handleContractorTokenInvitation);
router.get("/get-submission-pendings-notificaton", ...WithOrginazationAdminAndRole(GetSubmissionPrequalificationNotification));
// routes for induction testing
router.post("/register-with-induction-contractor", RegitserContractiorInducation);
router.post("/verify-mobile-and-email", VerifyMobileAndEmail);
router.post("/contractor-registration-uploading", uploadFiles, ContractorRegistrationForm);
router.post("/upload-contractor-documents", UploadInductionDocuments, UploadContractorDocuments);
router.get("/get-all-uploaded-documents", GetUploadedDocuments);
router.post("/create-trade-type", CreateTradeTypes);
router.get("/get-all-trade-types", GetAllTradeTypes);
router.post("/added-pdf-induction-contractor", uploadFiles, UploadContentInduction);
router.get("/get-induction-pdf", GetInductionContractorPdf);
router.post("/added-induction-content", AddedInductionContent);
router.get("/get-all-induction-content", GetInductionContent);
router.post("/create-trade-type-select-documents", TradeTypeDoucmentCreate);
router.get("/uploaded-all-trade-type-documents", getAllTraderTpeUploadedDocuments);
router.get("/get-all-trade-type-select-documents", GetTradeTypeselectDocuments);

// router.get("/get-induction-list", ...WithOrginazationAdminAndRole(GetInductionList));


router.post("/change-email-request", ...WithOrginazationAdminAndRole(ChangeEmailRequest));
router.get("/get-all-contractor-induction-list", ...WithOrginazationAdminAndRole(GetAllInductionRegister));
router.get("/get-invitation-org-id", GetInvitationorgId);
router.get("/search-location", SearchLocation);

router.get("/fetch-prequalification-organization-to-induction", ...WithOrginazationAdminAndRole(FetchPrequalification));
router.get("/get-all-documents-contractor", ...WithOrginazationAdminAndRole(getAllDocumentContractor));
// router.get("/get-all-documents-contractor-details", ...WithOrginazationAdminAndRole(TestDataDetails));
router.put("/update-contractor-documents", ...WithOrginazationAdminAndRole(updateDocumentApprovalStatus));

router.get("/get-all-documents-for-worker", ...WithOrginazationAdminAndRole(GetAllDocumentsForWorker));

router.post("/send-invitation-link-all-contractor", ...WithOrginazationAdminAndRole(SendIvitationLinkContractorWorker));
router.get("/all-contractor-admins", ...WithOrginazationAdminAndRole(getAllContractorAdmins));
router.put("/approved-worker-document", ...WithOrginazationAdminAndRole(ApprovedWorkerDocument));
// router.get("/testing-routes",TestingRoute );

module.exports = router;
