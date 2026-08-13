const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Administrative routes - user management is restricted to Super Admin (1) and
// Admin (2). Without this, any authenticated account (including a
// self-registered Viewer/Customer) could PATCH /:id with { role: 1 } and
// promote itself to Super Admin.
router.use(protect);
router.use(authorize(1, 2));

router.get('/', usersController.getAll);
router.post('/', usersController.create);
router.get('/:id', usersController.getById);
router.patch('/:id', usersController.update);
router.delete('/:id', usersController.delete);

module.exports = router;
