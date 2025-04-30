const multer = require('multer');
const path = require('path');

// Allowed file types with MIME types
const allowedFileTypes = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt'
};

// File filter function
const fileFilter = (req, file, cb) => {
  if (allowedFileTypes[file.mimetype]) {
    cb(null, true);
  } else {
    console.log('File type:', file.mimetype);
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'), false);
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = allowedFileTypes[file.mimetype];
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '.' + ext);
  }
});

// Configure multer with limits and filter
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;