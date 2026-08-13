const express = require('express');
const router = express.Router();
const postsController = require('./posts.controller');
const { protect, authorizeSection } = require('../../middleware/authMiddleware');

// Super Admin/Admin always have access to the write routes below; Editor/
// Staff Viewer need an explicit 'cms.blogs' grant (see modules/permissions).
const requireBlogsAccess = [protect, authorizeSection('cms.blogs')];

router.get('/', postsController.getAll);
router.get('/categories', postsController.getAllCategories);
router.post('/categories', ...requireBlogsAccess, postsController.createCategory);
router.get('/tags', postsController.getAllTags);
router.post('/tags', ...requireBlogsAccess, postsController.createTag);
router.get('/:id', postsController.getById);
router.get('/slug/:slug', postsController.getBySlug);

router.post('/', ...requireBlogsAccess, postsController.create);
router.patch('/:id', ...requireBlogsAccess, postsController.update);
router.delete('/:id', ...requireBlogsAccess, postsController.delete);

module.exports = router;
