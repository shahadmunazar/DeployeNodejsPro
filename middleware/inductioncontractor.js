const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Load and parse the document type JSON
const filePath = path.join(__dirname, '../../../jsonfiles/tradetypeselectdocuments.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const parsed = JSON.parse(rawData);
const documents = parsed.selectdocuments;

// Convert document_type to safe folder names
const toSafeName = str =>
  str.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');

// Create folders grouped by trade_type_id and document_type
const baseUploadDir = path.join(__dirname, '../../../uploads/contractorRegistratioDocuments');

// Extract all unique combinations of trade_type_id and document_type
const uniqueCombos = [
  ...new Set(documents.map(d => `${d.trade_type_id}|||${toSafeName(d.document_type)}`))
];

uniqueCombos.forEach(combo => {
  const [tradeId, safeDocType] = combo.split('|||');
  const dirPath = path.join(baseUploadDir, tradeId, safeDocType);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created folder: ${dirPath}`);
  }
});

// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const { trade_type_id } = req.body;
      const docType = file.fieldname;
      if (!trade_type_id) {
        return cb(new Error("Missing trade_type_id in request body"), false);
      }

      const safeDocType = toSafeName(docType);
      const uploadDir = path.join(baseUploadDir, trade_type_id, safeDocType);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created folder dynamically: ${uploadDir}`);
      }

      cb(null, uploadDir);
    } catch (err) {
      cb(err, false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF and image files are allowed."), false);
  }
  cb(null, true);
};

// Generate multer fields dynamically
const safeFields = [...new Set(documents.map(doc => toSafeName(doc.document_type)))];
const fields = safeFields.map(name => ({ name, maxCount: 1 }));
const UploadInductionDocuments = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
}).fields(fields);

module.exports = UploadInductionDocuments;
