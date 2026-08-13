const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { protect, authorize, optionalAuth } = require('../../middleware/authMiddleware');

// Author Metadata routes - Editors manage their own author bio alongside
// Admin/Super Admin.
router.get('/author/:id', protect, authorize(1, 2, 3), settingsController.getAuthorMeta);
router.post('/author/:id', protect, authorize(1, 2, 3), settingsController.saveAuthorMeta);

// Generic Settings routes
// Not used by the frontend (which fetches keys individually via GET /:key) and
// returns whole settings groups (e.g. "smtp", which includes smtp_password) in
// one shot, so it must never be reachable without admin auth.
router.get('/group/:group', protect, authorize(1, 2), settingsController.getSettingsByGroup);

// Specific routes MUST come before parameterized routes
router.get('/modules', settingsController.getSystemModules);
router.post('/modules', protect, authorize(1, 2), settingsController.updateSystemModules);

// Parameterized routes.
// Public by default (site_name, company info, etc. are rendered on public
// pages), but the controller blocks sensitive keys (smtp_*, *password*,
// *secret*, *token*, api_key) unless the caller is an authenticated admin/editor.
router.get('/:key', optionalAuth, settingsController.getSetting);
// Site-wide settings (including SMTP credentials) - Admin/Super Admin only.
router.post('/', protect, authorize(1, 2), settingsController.saveSetting);

module.exports = router;
