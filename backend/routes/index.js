const express = require('express');
const setupRoutes = require('../modules/setup/setup.routes');
const designerRoutes = require('../modules/designer/designer.routes');
const authRoutes = require('../modules/auth/auth.routes');
const acfRoutes = require('../modules/acf/acf.routes');
const pageRoutes = require('../modules/pages/pages.routes');
const mediaRoutes = require('../modules/media/media.routes');
const postRoutes = require('../modules/posts/posts.routes');
const authorRoutes = require('../modules/authors/authors.routes');
const usersRoutes = require('../modules/users/users.routes');
const settingsRoutes = require('../modules/settings/settings.routes');
const ecommerceRoutes = require('../modules/ecommerce/ecommerce.routes');
const seoRoutes = require('../modules/seo/seo.routes');
const menuRoutes = require('../modules/menus/menus.routes');
const formsRoutes = require('../modules/forms/forms.routes');
const reportsRoutes = require('../modules/reports/reports.routes');
const careersRoutes = require('../modules/careers/careers.routes');
const profileRoutes = require('../modules/profile/profile.routes');
const cptRoutes = require('../modules/cpt/cpt.routes');
const permissionsRoutes = require('../modules/permissions/permissions.routes');

const router = express.Router();

/**
 * Main API Route aggregator
 */
router.use('/setup', setupRoutes);
router.use('/designer', designerRoutes);
router.use('/auth', authRoutes);
router.use('/acf', acfRoutes);
router.use('/pages', pageRoutes);
router.use('/media', mediaRoutes);
router.use('/posts', postRoutes);
router.use('/authors', authorRoutes);
router.use('/users', usersRoutes);
router.use('/settings', settingsRoutes);
router.use('/ecommerce', ecommerceRoutes);
router.use('/seo', seoRoutes);
router.use('/menus', menuRoutes);
router.use('/forms', formsRoutes);
router.use('/reports', reportsRoutes);
router.use('/careers', careersRoutes);
router.use('/profile', profileRoutes);
router.use('/cpt', cptRoutes);
router.use('/permissions', permissionsRoutes);

module.exports = router;
