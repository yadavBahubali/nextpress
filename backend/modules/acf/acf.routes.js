const express = require('express');
const router = express.Router();
const acfController = require('./acf.controller');
const { protect, authorizeSection } = require('../../middleware/authMiddleware');

// Field Group Management. Super Admin/Admin always have access; Editor/
// Staff Viewer need an explicit 'cms.acf' grant (see modules/permissions).
router.use(protect);
router.use(authorizeSection('cms.acf'));

router.get('/groups', acfController.getAllGroups);
router.get('/groups/for-page/:id', acfController.getGroupsForPage);
router.get('/groups/for-post/:id', acfController.getGroupsForPost);
router.get('/groups/for-post-type/:slug', acfController.getGroupsForPostType);
router.post('/groups/for-page/:id', acfController.updatePageMappings);
router.get('/groups/:id', acfController.getGroup);
router.post('/groups', acfController.createGroup);
router.put('/groups/:id', acfController.updateGroup);
router.delete('/groups/:id', acfController.deleteGroup);

module.exports = router;
