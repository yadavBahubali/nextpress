const express = require('express');
const router = express.Router();
const pageController = require('./pages.controller');
const { protect, authorizeSection } = require('../../middleware/authMiddleware');

// Public routes for frontend
router.get('/public', pageController.getPublicPages);
router.get('/slug/:slug', pageController.getPageBySlug);

// Admin routes. Super Admin/Admin always have access; Editor/Staff Viewer
// need an explicit 'cms.pages' grant (see modules/permissions).
router.use(protect);
router.use(authorizeSection('cms.pages'));

router.get('/', pageController.getPages);
router.get('/templates', pageController.getTemplates);
router.get('/:id', pageController.getPageById);
router.post('/', pageController.createPage);
router.put('/:id', pageController.updatePage);
router.delete('/:id', pageController.deletePage);

module.exports = router;
