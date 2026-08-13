const express = require('express');
const router = express.Router();
const seoController = require('./seo.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Public routes (needed for frontend head generation).
// Fixed/literal-segment routes MUST be registered before the generic
// `/:entityType/:entityId` pattern below: Express matches by registration
// order, and a two-segment literal path like `/sitemap/entries` or
// `/robots/save` would otherwise be silently swallowed by
// `/:entityType/:entityId` (entityType="sitemap", entityId="entries") and
// never reach its intended handler.
router.get('/global', seoController.getGlobalSeo);
router.get('/redirects', seoController.getRedirects);
router.get('/sitemap.xml', seoController.generateSitemap);

// Admin routes - technical SEO configuration (robots.txt, sitemap generation,
// site health, per-entity SEO overrides). Restricted to Admin/Super Admin.
router.get('/health', protect, authorize(1, 2), seoController.getSiteHealth);
router.post('/robots/save', protect, authorize(1, 2), seoController.saveRobotsTxt);
router.get('/sitemap/entries', protect, authorize(1, 2), seoController.getSitemapEntries);
router.post('/generate-files', protect, authorize(1, 2), seoController.postGenerateSeoFiles);
router.delete('/id/:id', protect, authorize(1, 2), seoController.deleteSeoById);

// Generic entity routes - must come last (see note above).
router.get('/:entityType/:entityId', seoController.getSeo);
router.put('/:entityType/:entityId', protect, authorize(1, 2), seoController.upsertSeo);
router.delete('/:entityType/:entityId', protect, authorize(1, 2), seoController.deleteSeo);

module.exports = router;
