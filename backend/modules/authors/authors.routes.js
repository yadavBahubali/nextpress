const express = require('express');
const router = express.Router();
const authorsController = require('./authors.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Author records are site-wide (any Editor's author profile can be
// created/edited/deleted here), so this is restricted to Admin/Super Admin.
router.use(protect);
router.use(authorize(1, 2));

router.get('/', authorsController.getAll);
router.get('/:id', authorsController.getById);
router.post('/', authorsController.create);
router.patch('/:id', authorsController.update);
router.delete('/:id', authorsController.delete);

module.exports = router;
