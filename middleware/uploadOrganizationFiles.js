const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Helper to ensure directories exist
const ensureDir = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create directories
const directories = [
  "./uploads/organization/logo",
  "./uploads/organization/agreement_paper",
  "./uploads/contractorRegistratioDocuments/contractorInsurance",
  "./uploads/contractorRegistratioDocuments/contractor_public_liability",
  "./uploads/contractorRegistratioDocuments/safety_managment_doc",
  "./uploads/contractorRegistratioDocuments/registration_contractor_image",
  "./uploads/contractorRegistratioDocuments/covid_check_documents",
  "./uploads/contractorRegistratioDocuments/flu_vaccination_documents",
  "./uploads/contractorRegistratioDocuments/health_practitioner_registration",
  "./uploads/contractorRegistratioDocuments/police_check_documnets",
  "./uploads/contractorRegistratioDocuments/trade_qualification_documents",
  "./uploads/contractorRegistratioDocuments/contractor_induction_pdf"
];

directories.forEach(ensureDir);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const map = {
      logo: "./uploads/organization/logo",
      agreement_paper: "./uploads/organization/agreement_paper",
      contractor_insurance: "./uploads/contractorRegistratioDocuments/contractorInsurance",
      contractor_liability: "./uploads/contractorRegistratioDocuments/contractor_public_liability",
      safety_contractor_managment: "./uploads/contractorRegistratioDocuments/safety_managment_doc",
      contractor_image: "./uploads/contractorRegistratioDocuments/registration_contractor_image",
      covid_check_documents: "./uploads/contractorRegistratioDocuments/covid_check_documents",
      flu_vaccination_documents: "./uploads/contractorRegistratioDocuments/flu_vaccination_documents",
      health_practitioner_registration: "./uploads/contractorRegistratioDocuments/health_practitioner_registration",
      police_check_documnets: "./uploads/contractorRegistratioDocuments/police_check_documnets",
      trade_qualification_documents: "./uploads/contractorRegistratioDocuments/trade_qualification_documents",
      contractor_induction_pdf: "./uploads/contractorRegistratioDocuments/contractor_induction_pdf"
    };

    const uploadPath = map[file.fieldname];
    if (!uploadPath) return cb(new Error("Invalid file field"), false);

    console.log(`Uploading ${file.fieldname} to: ${uploadPath}`);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    console.log(`File being uploaded: ${file.originalname}`);
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const imageFields = [
    "logo", "contractor_image", "covid_check_documents", "flu_vaccination_documents",
    "health_practitioner_registration", "police_check_documnets", "trade_qualification_documents"
  ];

  const pdfFields = [
    "agreement_paper", "contractor_insurance", "contractor_liability",
    "safety_contractor_managment", "contractor_induction_pdf"
  ];

  if (imageFields.includes(file.fieldname)) {
    const isValid = /^image\/(jpeg|jpg|png|gif|bmp|webp)$/i.test(file.mimetype);
    if (!isValid) {
      return cb(new Error(`Only image files are allowed for ${file.fieldname}`));
    }
  } else if (pdfFields.includes(file.fieldname)) {
    const isValid = /pdf$/i.test(file.mimetype);
    if (!isValid) {
      return cb(new Error(`Only PDF files are allowed for ${file.fieldname}`));
    }
  } else {
    return cb(new Error("Invalid file field"));
  }

  cb(null, true);
};

// Multer upload configuration
const uploadFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "agreement_paper", maxCount: 1 },
  { name: "contractor_insurance", maxCount: 1 },
  { name: "contractor_liability", maxCount: 1 },
  { name: "safety_contractor_managment", maxCount: 1 },
  { name: "contractor_image", maxCount: 1 },
  { name: "covid_check_documents", maxCount: 1 },
  { name: "flu_vaccination_documents", maxCount: 1 },
  { name: "health_practitioner_registration", maxCount: 1 },
  { name: "police_check_documnets", maxCount: 1 },
  { name: "trade_qualification_documents", maxCount: 1 },
  { name: "contractor_induction_pdf", maxCount: 1 }
]);

module.exports = uploadFiles;
