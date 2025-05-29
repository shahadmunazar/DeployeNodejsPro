const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = path.join(__dirname, '../jsonfiles/tradetypeselectdocuments.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const parsed = JSON.parse(rawData);
const allowedFields = parsed.selectdocuments
  .map((doc, i) => {
    if (!doc.documents_filed_name) {
      console.warn(`Warning: Missing 'documents_filed_name' at index ${i}:`, doc);
    }
    return doc.documents_filed_name;
  })
  .filter(field => typeof field === 'string' && field.trim() !== '');
if (!allowedFields.length) {
  throw new Error("No valid 'documents_filed_name' found in tradetypeselectdocuments.json");
}
console.log("Allowed fields:", allowedFields);
const uploadFolders = {};
allowedFields.forEach(field => {
  const folderPath = `./uploads/InductionRegisterDocuments/${field}`;
  uploadFolders[field] = folderPath;
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = uploadFolders[file.fieldname];
    if (folder) {
      console.log(`Uploading ${file.fieldname} to:`, folder);
      cb(null, folder);
    } else {
      cb(new Error("Invalid file field name"), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const fileFilter = (req, file, cb) => {
  if (!allowedFields.includes(file.fieldname)) {
    return cb(new Error("Invalid field name"), false);
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
}).fields(allowedFields.map(field => ({ name: field, maxCount: 1 })));
module.exports = uploadDocuments;
