const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const subDirs = ['images', 'videos', 'docs'];

subDirs.forEach(dir => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'docs';
    if (file.mimetype.startsWith('image/')) folder = 'images';
    else if (file.mimetype.startsWith('video/')) folder = 'videos';
    
    cb(null, path.join(uploadDir, folder));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

/**
 * Dynamic Upload Middleware
 * Fetches limits and allowed types from the settings table
 */
const dynamicUpload = (type, mode = 'single', fieldName = 'file') => {
  return async (req, res, next) => {
    try {
      // Lazy load settings service to avoid circular dependencies
      const settingsService = require('../modules/settings/settings.service');
      
      const maxImageSize = await settingsService.getSetting('media_max_image_size', 5);
      const maxVideoSize = await settingsService.getSetting('media_max_video_size', 100);
      // svg deliberately excluded from the default: an SVG can embed a
      // <script> tag, and served back inline (see app.js's /uploads static
      // handler) it executes in the site's origin if opened directly -
      // stored XSS. If SVG uploads are genuinely needed, sanitize on upload
      // (e.g. strip <script>/on* attributes) rather than re-adding this.
      const allowedExtsStr = await settingsService.getSetting('media_allowed_extensions', 'jpg, jpeg, png, gif, webp, mp4, mov, pdf, doc, docx');
      
      const allowedExts = allowedExtsStr.split(',').map(s => s.trim().toLowerCase().replace('.', ''));
      
      // Determine limit based on type
      let limit = 100; // Default 100MB
      if (type === 'image') limit = parseFloat(maxImageSize);
      else if (type === 'video') limit = parseFloat(maxVideoSize);

      const uploadInstance = multer({
        storage: storage,
        limits: { fileSize: limit * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
          
          // Check extension
          if (!allowedExts.includes(ext)) {
            return cb(new ApiError(400, `File extension .${ext} is not allowed!`), false);
          }

          // Additional mime-type check for safety
          if (type === 'image' && !file.mimetype.startsWith('image/')) {
            return cb(new ApiError(400, 'Only images are allowed!'), false);
          }
          if (type === 'video' && !file.mimetype.startsWith('video/')) {
            return cb(new ApiError(400, 'Only videos are allowed!'), false);
          }

          cb(null, true);
        }
      });

      const multerMiddleware = mode === 'single' ? uploadInstance.single(fieldName) : uploadInstance.array(fieldName, 10);
      
      multerMiddleware(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, `File too large. Max allowed size is ${limit}MB`));
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new ApiError(400, `Unexpected field "${err.field}". Please use "${fieldName}"`));
          }
          return next(err);
        }
        next();
      });
    } catch (err) {
      next(err);
    }
  };
};

// Export specialized middleware
module.exports = {
  upload: dynamicUpload('all', 'array', 'files'),
  uploadImage: dynamicUpload('image', 'single', 'image'),
  uploadVideo: dynamicUpload('video', 'single', 'video'),
  uploadDocument: dynamicUpload('document', 'single', 'resume'),
  uploadAttachment: dynamicUpload('document', 'single', 'attachment')
};
