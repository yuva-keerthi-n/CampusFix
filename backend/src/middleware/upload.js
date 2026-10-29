const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ApiError } = require('./errorHandler');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 5);
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function ensureSubDir(subDir) {
  const fullPath = path.join(process.cwd(), UPLOAD_DIR, subDir);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

function makeUploader(subDir) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureSubDir(subDir));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new ApiError(400, 'Only JPG, JPEG, PNG and WEBP images are allowed.'));
      }
      cb(null, true);
    },
  });
}

// Two named uploaders: complaint issue photos, and staff resolution photos.
const uploadComplaintImage = makeUploader('complaints');
const uploadResolutionImage = makeUploader('resolutions');

module.exports = { uploadComplaintImage, uploadResolutionImage };
