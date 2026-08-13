const seoService = require('./seo.service');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get SEO data for an entity
 */
exports.getSeo = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const seoData = await seoService.getSeoData(entityType, entityId);
  
  res.json({
    status: 'success',
    data: seoData
  });
});

/**
 * Get Global SEO settings
 */
exports.getGlobalSeo = asyncHandler(async (req, res) => {
  const seoData = await seoService.getGlobalSeo();
  
  res.json({
    status: 'success',
    data: seoData
  });
});

/**
 * Upsert SEO data
 */
exports.upsertSeo = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const seoData = {
    ...req.body,
    entity_type: entityType,
    entity_id: entityId === 'null' ? null : entityId
  };

  await seoService.upsertSeoData(seoData);
  
  // Auto-generate SEO files (sitemap, robots.txt)
  try {
    await seoService.updatePublicSeoFiles();
  } catch (err) {
    console.error('Failed to auto-update SEO files:', err.message);
  }
  
  res.json({
    status: 'success',
    message: 'SEO data saved successfully'
  });
});

/**
 * Get all redirects
 */
exports.getRedirects = asyncHandler(async (req, res) => {
  const redirects = await seoService.getAllRedirects();
  
  res.json({
    status: 'success',
    data: redirects
  });
});

/**
 * Get all sitemap entries
 */
exports.getSitemapEntries = asyncHandler(async (req, res) => {
  const entries = await seoService.getSitemapEntries();
  
  res.json({
    status: 'success',
    data: entries
  });
});

/**
 * Get site SEO health
 */
exports.getSiteHealth = asyncHandler(async (req, res) => {
  const health = await seoService.getSiteHealth();
  
  res.json({
    status: 'success',
    data: health
  });
});

/**
 * Save custom robots.txt
 */
exports.saveRobotsTxt = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const settingsService = require('../settings/settings.service');
  
  await settingsService.saveSetting('robots_txt_custom', content, 'seo');
  
  // Refresh files
  await seoService.updatePublicSeoFiles();
  
  res.json({
    status: 'success',
    message: 'Robots.txt updated and published successfully'
  });
});

/**
 * Trigger SEO files generation and saving to public folder
 */
exports.postGenerateSeoFiles = asyncHandler(async (req, res) => {
  const results = await seoService.updatePublicSeoFiles();
  
  res.json({
    status: 'success',
    message: 'SEO files (sitemap, robots.txt) generated and saved successfully',
    results
  });
});

/**
 * Delete SEO data
 */
exports.deleteSeo = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  await seoService.deleteSeoData(entityType, entityId);
  
  res.json({
    status: 'success',
    message: 'SEO data deleted successfully'
  });
});

/**
 * Delete SEO data by ID
 */
exports.deleteSeoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await seoService.deleteSeoById(id);
  
  res.json({
    status: 'success',
    message: 'SEO data deleted successfully'
  });
});

/**
 * Generate Sitemap
 */
exports.generateSitemap = asyncHandler(async (req, res) => {
  const xml = await seoService.generateSitemap();
  
  // Get domain from settings to replace placeholder
  const settingsService = require('../settings/settings.service');
  const domainRes = await settingsService.getSetting('site_domain');
  const domain = domainRes || 'https://nextpress.com';
  
  const finalXml = xml.replace(/%DOMAIN%/g, domain.replace(/\/$/, ''));
  
  res.header('Content-Type', 'application/xml');
  res.send(finalXml);
});

