const acfService = require('./acf.service');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * List all ACF groups with pagination and search
 */
exports.getAllGroups = asyncHandler(async (req, res) => {
  const result = await acfService.listGroups(req.query);
  res.json({
    success: true,
    data: result.groups,
    total: result.total
  });
});

/**
 * Get ACF groups for a specific page (Schema Mapper)
 */
exports.getGroupsForPage = asyncHandler(async (req, res) => {
  const groups = await acfService.getGroupsForPage(req.params.id);
  res.json({
    success: true,
    data: groups
  });
});

/**
 * Get ACF groups for a specific post (Schema Mapper)
 */
exports.getGroupsForPost = asyncHandler(async (req, res) => {
  const groups = await acfService.getGroupsForPost(req.params.id);
  res.json({
    success: true,
    data: groups
  });
});

/**
 * Get ACF groups for a Custom Post Type, matched by slug (Schema Mapper).
 * Needed before any entry of that type exists yet (e.g. the "Create New
 * Industry" screen), unlike getGroupsForPage/getGroupsForPost which require
 * an existing page/post id.
 */
exports.getGroupsForPostType = asyncHandler(async (req, res) => {
  const groups = await acfService.getGroupsForPostType(req.params.slug);
  res.json({
    success: true,
    data: groups
  });
});

/**
 * Update ACF group mappings for a page
 */
exports.updatePageMappings = asyncHandler(async (req, res) => {
  await acfService.updatePageMappings(req.params.id, req.body.field_group_ids || []);
  res.json({
    success: true,
    message: 'Page field group mappings updated successfully'
  });
});

/**
 * Get a specific group by ID
 */
exports.getGroup = asyncHandler(async (req, res) => {
  const group = await acfService.getGroup(req.params.id);
  res.json({
    success: true,
    data: group
  });
});

/**
 * Create a new field group
 */
exports.createGroup = asyncHandler(async (req, res) => {
  const id = await acfService.createGroup(req.body);
  res.status(201).json({
    success: true,
    data: { id },
    message: 'Field group created successfully'
  });
});

/**
 * Update an existing field group
 */
exports.updateGroup = asyncHandler(async (req, res) => {
  await acfService.updateGroup(req.params.id, req.body);
  res.json({
    success: true,
    message: 'Field group updated successfully'
  });
});

/**
 * Delete a field group
 */
exports.deleteGroup = asyncHandler(async (req, res) => {
  await acfService.deleteGroup(req.params.id);
  res.json({
    success: true,
    message: 'Field group deleted successfully'
  });
});
