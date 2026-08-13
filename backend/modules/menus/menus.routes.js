const express = require('express');
const router = express.Router();
const menusController = require('./menus.controller');
const { protect, authorizeSection } = require('../../middleware/authMiddleware');

// Public route for fetching menu by slug (for frontend display)
router.get('/slug/:slug', menusController.getMenuBySlug);
router.get('/location/:location', menusController.getMenuByLocation);

// Admin routes. Super Admin/Admin always have access; Editor/Staff Viewer
// need an explicit 'cms.menus' grant (see modules/permissions) - previously
// Admin-only with no way to extend access, despite the sidebar already
// showing this link to Editors under CMS Management.
router.use(protect);
router.use(authorizeSection('cms.menus'));

// Search entities (Pages, Posts) for menu builder
router.get('/entities/search', menusController.searchEntities);

// Menu CRUD
router.route('/')
  .get(menusController.getAllMenus)
  .post(menusController.createMenu);

router.route('/:id')
  .get(menusController.getMenuById)
  .put(menusController.updateMenu)
  .delete(menusController.deleteMenu);

// Sync menu structure
router.post('/:id/sync', menusController.syncMenuItems);

module.exports = router;
