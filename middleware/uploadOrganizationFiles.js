const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure folders exist
const ensureDir = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir("./uploads/organization/logo");
ensureDir("./uploads/organization/agreement_paper");
ensureDir("./uploads/contractorRegistratioDocuments/contractorInsurance");
ensureDir("./uploads/contractorRegistratioDocuments/contractor_public_liability");
// safety_managment_doc
ensureDir("./uploads/contractorRegistratioDocuments/safety_managment_doc");
ensureDir("./uploads/contractorRegistratioDocuments/registration_contractor_image");

// inductionDocuments Directory start
ensureDir("./uploads/contractorRegistratioDocuments/covid_check_documents");
ensureDir("./uploads/contractorRegistratioDocuments/flu_vaccination_documents");
ensureDir("./uploads/contractorRegistratioDocuments/health_practitioner_registration");
ensureDir("./uploads/contractorRegistratioDocuments/police_check_documnets");
ensureDir("./uploads/contractorRegistratioDocuments/trade_qualification_documents");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "logo") {
      console.log("Uploading logo to: ./uploads/organization/logo");
      cb(null, "./uploads/organization/logo");
    } else if (file.fieldname === "agreement_paper") {
      console.log("Uploading agreement paper to: ./uploads/organization/agreement_paper");
      cb(null, "./uploads/organization/agreement_paper");
    } else if (file.fieldname === "contractor_insurance") {
      console.log("Uploading agreement paper to: ./uploads/contractorRegistratioDocuments/contractorInsurance");
      cb(null, "./uploads/contractorRegistratioDocuments/contractorInsurance");
    } else if (file.fieldname === "contractor_liability") {
      console.log("Uploading agreement paper to: ./uploads/contractorRegistratioDocuments/contractor_public_liability");
      cb(null, "./uploads/contractorRegistratioDocuments/contractor_public_liability");
    } else if (file.fieldname === "safety_contractor_managment") {
      console.log("Uploading agreement paper to: ./uploads/contractorRegistratioDocuments/safety_managment_doc");
      cb(null, "./uploads/contractorRegistratioDocuments/safety_managment_doc");
    } else if (file.fieldname === "contractor_image") {
      console.log("Uploading user image to: ./uploads/contractorRegistratioDocuments/registration_contractor_image");
      cb(null, "./uploads/contractorRegistratioDocuments/registration_contractor_image");
    } else if (file.fieldname === "covid_check_documents") {
      console.log("Uploading user image to: ./uploads/contractorRegistratioDocuments/covid_check_documents");
      cb(null, "./uploads/contractorRegistratioDocuments/covid_check_documents");
    } else if (file.fieldname === "flu_vaccination_documents") {
      console.log("Uploading user image to: ./uploads/contractorRegistratioDocuments/flu_vaccination_documents");
      cb(null, "./uploads/contractorRegistratioDocuments/flu_vaccination_documents");
    } else if (file.fieldname === "health_practitioner_registration") {
      console.log("Uploading user image to: ./uploads/contractorRegistratioDocuments/health_practitioner_registration");
      cb(null, "./uploads/contractorRegistratioDocuments/health_practitioner_registration");
    } else if (file.fieldname === "police_check_documnets") {
      console.log("Uploading user image to: ./uploads/contractorRegistratioDocuments/police_check_documnets");
      cb(null, "./uploads/contractorRegistratioDocuments/police_check_documnets");
    } else if (file.fieldname === "trade_qualification_documents") {
      console.log("Uploading user image to: ./uploads/contractorRegistratioDocuments/trade_qualification_documents");
      cb(null, "./uploads/contractorRegistratioDocuments/trade_qualification_documents");
    } else {
      cb(new Error("Invalid file field"), false);
    }
  },
  filename: (req, file, cb) => {
    console.log(`File being uploaded: ${file.originalname}`);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "logo") {
    const isValid = /jpeg|jpg|png|gif/.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only image files allowed for logo"));
    }
  } else if (file.fieldname === "agreement_paper") {
    const isValid = /pdf/.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only PDF allowed for agreement paper"));
    }
  } else if (file.fieldname === "contractor_insurance") {
    const isValid = /pdf/.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only PDF allowed for agreement paper"));
    }
  } else if (file.fieldname === "contractor_liability") {
    const isValid = /pdf/.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only PDF allowed for agreement paper"));
    }
  } else if (file.fieldname === "safety_contractor_managment") {
    const isValid = /pdf/.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only PDF allowed for agreement paper"));
    }
  } else if (file.fieldname === "contractor_image") {
    const isValid = /^image\/(jpeg|jpg|png|gif|bmp|webp)$/i.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only image files (jpeg, jpg, png, gif, bmp, webp) are allowed for Contractor Register Image"));
    }
  } else if (file.fieldname === "covid_check_documents") {
    const isValid = /^image\/(jpeg|jpg|png|gif|bmp|webp)$/i.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only image files (jpeg, jpg, png, gif, bmp, webp) are allowed for Contractor Register Image"));
    }
  } else if (file.fieldname === "flu_vaccination_documents") {
    const isValid = /^image\/(jpeg|jpg|png|gif|bmp|webp)$/i.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only image files (jpeg, jpg, png, gif, bmp, webp) are allowed for Contractor Register Image"));
    }
  } else if (file.fieldname === "health_practitioner_registration") {
    const isValid = /^image\/(jpeg|jpg|png|gif|bmp|webp)$/i.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only image files (jpeg, jpg, png, gif, bmp, webp) are allowed for Contractor Register Image"));
    }
  } else if (file.fieldname === "police_check_documnets") {
    const isValid = /^image\/(jpeg|jpg|png|gif|bmp|webp)$/i.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only image files (jpeg, jpg, png, gif, bmp, webp) are allowed for Contractor Register Image"));
    }
  } else if (file.fieldname === "trade_qualification_documents") {
    const isValid = /^image\/(jpeg|jpg|png|gif|bmp|webp)$/i.test(file.mimetype);
    if (!isValid) {
      return cb(new Error("Only image files (jpeg, jpg, png, gif, bmp, webp) are allowed for Contractor Register Image"));
    }
  }
  cb(null, true);
};

const uploadFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
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
]);

module.exports = uploadFiles;
