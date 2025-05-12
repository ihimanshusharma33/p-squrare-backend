import multer from 'multer';
import path from 'path';
import ErrorResponse from './errorResponse.js';

// Set storage engine
const storage = multer.memoryStorage();

// Check file type
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const filetypes = /pdf|doc|docx/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('Error: Resume must be a PDF, DOC, or DOCX file!', 400));
  }
};

// Initialize upload
export const resumeUpload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter
}).single('resume');

// File upload middleware
export const uploadResume = (req, res, next) => {
  resumeUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ErrorResponse('Error: File size is too large. Maximum size is 5MB', 400));
      }
      return next(new ErrorResponse(`Multer error: ${err.message}`, 400));
    } else if (err) {
      return next(err);
    }
    next();
  });
};