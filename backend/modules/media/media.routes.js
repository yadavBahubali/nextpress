const express = require('express');
const router = express.Router();
const mediaController = require('./media.controller');
const { upload, uploadImage, uploadVideo } = require('../../middleware/uploadMiddleware');
const { protect, authorizeSection } = require('../../middleware/authMiddleware');

// Self-service upload for the founder portal (/my). Deliberately NOT part
// of the media library: it only ever accepts and returns the single file
// just uploaded - no browsing, no listing, no delete, so a founder editing
// their own entry can never see or touch anyone else's uploads. Any
// authenticated account can use it (not gated by 'cms.media'), since it
// exposes nothing beyond "store this one file I'm sending right now".
router.post('/upload/mine', protect, uploadImage, mediaController.uploadImage);

// Media library management. Super Admin/Admin always have access; Editor/
// Staff Viewer need an explicit 'cms.media' grant (see modules/permissions).
router.use(protect);
router.use(authorizeSection('cms.media'));

// Batch or Single upload
router.post('/upload', upload, mediaController.upload);

// Specialized single uploads
router.post('/upload/image', uploadImage, mediaController.uploadImage);
router.post('/upload/video', uploadVideo, mediaController.uploadVideo);

router.get('/', mediaController.getAll);
router.get('/:id', mediaController.getById);
router.patch('/:id', mediaController.update);
router.delete('/:id', mediaController.delete);

module.exports = router;
