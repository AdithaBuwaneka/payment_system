// uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Get upload directory from environment or use default
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage with better organization and security
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create a sub-directory for the current date to organize uploads
    const now = new Date();
    const dateDir = path.join(
      uploadDir, 
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
    
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }
    
    cb(null, dateDir);
  },
  filename: function (req, file, cb) {
    // Generate a secure random filename while preserving original extension
    const fileExt = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    const safeName = `${randomName}${fileExt}`;
    
    cb(null, safeName);
  }
});

// File filter to ensure only allowed file types
const fileFilter = (req, file, cb) => {
  // Whitelist of allowed file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (jpg, jpeg, png) and PDF files are allowed'));
  }
};

// Initialize multer uploader with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // Default to 10MB if not set in environment
    files: 1 // Allow only one file per request
  },
  fileFilter: fileFilter
});

// Middleware to handle file upload and append file info to request
const handleFileUpload = (req, res, next) => {
  const uploadSingle = upload.single('file');
  
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific error (file size, etc.)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // Other errors (file type, etc.)
      return res.status(400).json({ message: err.message });
    }
    
    // If no file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    // Add file URL to the file object
    req.file.fileUrl = `/uploads/${req.file.path.split('uploads')[1]}`;
    
    next();
  });
};

module.exports = {
  uploadSingle: handleFileUpload
};