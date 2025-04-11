const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure folders exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir('./uploads/organization/logo');
ensureDir('./uploads/organization/agreement_paper');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'logo') {
      console.log('Uploading logo to: ./uploads/organization/logo');
      cb(null, './uploads/organization/logo');
    } else if (file.fieldname === 'agreement_paper') {
      console.log('Uploading agreement paper to: ./uploads/organization/agreement_paper');
      cb(null, './uploads/organization/agreement_paper');
    } else {
      cb(new Error('Invalid file field'), false);
    }
  },
  filename: (req, file, cb) => {
    console.log(`File being uploaded: ${file.originalname}`);
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'logo') {
    const isValid = /jpeg|jpg|png|gif/.test(file.mimetype);
    if (!isValid) {
      return cb(new Error('Only image files allowed for logo'));
    }
  } else if (file.fieldname === 'agreement_paper') {
    const isValid = /pdf/.test(file.mimetype);
    if (!isValid) {
      return cb(new Error('Only PDF allowed for agreement paper'));
    }
  }
  cb(null, true);
};

const uploadFiles = multer({
  storage,
  fileFilter
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'agreement_paper', maxCount: 1 }
]);

module.exports = uploadFiles;
