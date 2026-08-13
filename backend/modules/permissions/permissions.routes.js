const express = require('express');
const router = express.Router();
const permissionsController = require('./permissions.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

// Any logged-in user can read their own grants (the sidebar needs this for
// every Editor/Viewer login) - Super Admin/Admin never call this, they get
// everything unconditionally.
router.get('/me', permissionsController.getMine);

// Managing sections/other users' grants is Super Admin/Admin only.
router.get('/sections', authorize(1, 2), permissionsController.getSections);
router.get('/user/:userId', authorize(1, 2), permissionsController.getForUser);
router.put('/user/:userId', authorize(1, 2), permissionsController.setForUser);

module.exports = router;
