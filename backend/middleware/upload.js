const multer = require('multer');
const path = require('path');

// Use disk storage for local dev; swap for cloudinary in production
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp/uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// For Cloudinary production setup:
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, ... });
// const storage = new CloudinaryStorage({ cloudinary, params: { folder: 'ai-shop', allowed_formats: ['jpg','png','webp'] } });

module.exports = upload;
