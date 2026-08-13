const postsService = require('./posts.service');
const seoService = require('../seo/seo.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const posts = await postsService.getAllPosts(req.query);
  res.json({
    success: true,
    data: posts
  });
});

exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await postsService.getAllCategories();
  res.json({
    success: true,
    data: categories
  });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await postsService.createCategory(req.body);
  res.status(201).json({
    success: true,
    data: category
  });
});

exports.getAllTags = asyncHandler(async (req, res) => {
  const tags = await postsService.getAllTags();
  res.json({
    success: true,
    data: tags
  });
});

exports.createTag = asyncHandler(async (req, res) => {
  const tag = await postsService.createTag(req.body);
  res.status(201).json({
    success: true,
    data: tag
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const post = await postsService.getPostById(req.params.id);
  res.json({
    success: true,
    data: post
  });
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const post = await postsService.getPostBySlug(req.params.slug);
  res.json({
    success: true,
    data: post
  });
});

exports.create = asyncHandler(async (req, res) => {
  const post = await postsService.createPost(req.body, req.user.id);
  
  // Auto-generate sitemap
  if (req.body.status === 'published') {
    try { await seoService.updatePublicSeoFiles(); } catch (e) { console.error('Sitemap update failed:', e.message); }
  }

  res.status(201).json({
    success: true,
    data: post,
    message: 'Post created successfully'
  });
});

exports.update = asyncHandler(async (req, res) => {
  const post = await postsService.updatePost(req.params.id, req.body);
  
  // Auto-generate sitemap
  try { await seoService.updatePublicSeoFiles(); } catch (e) { console.error('Sitemap update failed:', e.message); }

  res.json({
    success: true,
    data: post,
    message: 'Post updated successfully'
  });
});

exports.delete = asyncHandler(async (req, res) => {
  await postsService.deletePost(req.params.id);
  
  // Auto-generate sitemap
  try { await seoService.updatePublicSeoFiles(); } catch (e) { console.error('Sitemap update failed:', e.message); }

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
});
