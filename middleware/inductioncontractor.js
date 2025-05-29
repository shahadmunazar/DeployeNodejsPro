const multer = require("multer");
const path = require("path");
const fs = require("fs");
const allowedFields = [
  "police_check",
  "confined_spaces",
  "covid_vax",
  "elevated_work_platform_ewp_licence",
  "relevant_trade_qualification",
  "white_card",
  "annual_influenza_vaccination",
  "working_at_heights",
  "relevant_health_practitioner_registration",
  "a_class_electrical_licence",
  "chemical_licence",
  "b_class_electrical",
  "high_risk_work_licence",
  "plumbing_licence",
];


const uploadFolders = {
  police_check: "./uploads/contractorRegistratioDocuments/police_check",
  confined_spaces: "./uploads/contractorRegistratioDocuments/confined_spaces",
  covid_vax: "./uploads/contractorRegistratioDocuments/covid_vax",
  elevated_work_platform_ewp_licence: "./uploads/contractorRegistratioDocuments/elevated_work_platform_ewp_licence",
  relevant_trade_qualification: "./uploads/contractorRegistratioDocuments/relevant_trade_qualification",
  white_card: "./uploads/contractorRegistratioDocuments/white_card",
  annual_influenza_vaccination: "./uploads/contractorRegistratioDocuments/annual_influenza_vaccination",
  working_at_heights: "./uploads/contractorRegistratioDocuments/working_at_heights",
  relevant_health_practitioner_registration: "./uploads/contractorRegistratioDocuments/relevant_health_practitioner_registration",
  a_class_electrical_licence: "./uploads/contractorRegistratioDocuments/a_class_electrical_licence",
  chemical_licence: "./uploads/contractorRegistratioDocuments/chemical_licence",
  b_class_electrical: "./uploads/contractorRegistratioDocuments/b_class_electrical",
  high_risk_work_licence: "./uploads/contractorRegistratioDocuments/high_risk_work_licence",
  plumbing_licence: "./uploads/contractorRegistratioDocuments/plumbing_licence",
};

// Ensure all folders exist
for (const folder of Object.values(uploadFolders)) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (allowedFields.includes(file.fieldname)) {
      console.log("Uploadind file to:", uploadFolders[file.fieldname]);
      cb(null, uploadFolders[file.fieldname]);
    } else {
      cb(new Error("Invalid file field"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedFields.includes(file.fieldname)) {
    return cb(new Error("Invalid file field"), false);
  }
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }
  cb(null, true);
};

const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
}).fields(
  allowedFields.map((field) => ({ name: field, maxCount: 1 }))
);

module.exports = uploadDocuments;
