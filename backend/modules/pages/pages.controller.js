const pageService = require('./pages.service');
const seoService = require('../seo/seo.service');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Get all published pages (Public)
 */
exports.getPublicPages = asyncHandler(async (req, res) => {
  const pages = await pageService.getPublicPages();
  res.json({
    status: 'success',
    data: pages
  });
});

/**
 * Get all pages (Admin)
 */
exports.getPages = asyncHandler(async (req, res) => {
  const pages = await pageService.getAllPages();
  res.json({
    status: 'success',
    data: pages
  });
});

/**
 * Get page by ID (Admin/Editor)
 */
exports.getPageById = asyncHandler(async (req, res) => {
  const page = await pageService.getPageById(req.params.id);
  res.json({
    status: 'success',
    data: page
  });
});

/**
 * Get available templates
 */
exports.getTemplates = asyncHandler(async (req, res) => {
  const templates = await pageService.getTemplates();
  res.json({
    status: 'success',
    data: templates
  });
});

/**
 * Get page by slug (Frontend)
 */
exports.getPageBySlug = asyncHandler(async (req, res) => {
  const page = await pageService.getPageBySlug(req.params.slug);
  res.json({
    status: 'success',
    data: page
  });
});

/**
 * Create page
 */
exports.createPage = asyncHandler(async (req, res) => {
  const sections = req.body.sections || [];
  const pageData = req.body.pageData || { ...req.body };
  
  if (!req.body.pageData) {
    delete pageData.sections;
  }

  const id = await pageService.createPage(pageData, sections);
  
  // Auto-generate sitemap if published
  if (pageData.status === 'published') {
    try { await seoService.updatePublicSeoFiles(); } catch (e) { console.error('Sitemap update failed:', e.message); }
  }

  res.status(201).json({
    status: 'success',
    data: { id }
  });
});

/**
 * Update page
 */
exports.updatePage = asyncHandler(async (req, res) => {
  const sections = req.body.sections || null;
  const pageData = req.body.pageData || { ...req.body };
  
  if (!req.body.pageData) {
    delete pageData.sections;
  }

  await pageService.updatePage(req.params.id, pageData, sections);
  
  // Auto-generate sitemap
  try { await seoService.updatePublicSeoFiles(); } catch (e) { console.error('Sitemap update failed:', e.message); }

  res.json({
    status: 'success',
    message: 'Page updated successfully'
  });
});

/**
 * Delete page
 */
exports.deletePage = asyncHandler(async (req, res) => {
  await pageService.deletePage(req.params.id);
  
  // Auto-generate sitemap
  try { await seoService.updatePublicSeoFiles(); } catch (e) { console.error('Sitemap update failed:', e.message); }

  res.json({
    status: 'success',
    message: 'Page deleted successfully'
  });
});
