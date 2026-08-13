const menusService = require('./menus.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.getAllMenus = asyncHandler(async (req, res) => {
  const menus = await menusService.getAllMenus();
  res.json({
    status: 'success',
    data: menus
  });
});

exports.getMenuById = asyncHandler(async (req, res) => {
  const menu = await menusService.getMenuById(req.params.id);
  res.json({
    status: 'success',
    data: menu
  });
});

exports.getMenuBySlug = asyncHandler(async (req, res) => {
  const menu = await menusService.getMenuBySlug(req.params.slug);
  res.json({
    status: 'success',
    data: menu
  });
});

exports.getMenuByLocation = asyncHandler(async (req, res) => {
  try {
    const menu = await menusService.getMenuByLocation(req.params.location);
    res.json({
      status: 'success',
      data: menu
    });
  } catch (error) {
    if (error.statusCode === 404) {
      // Return empty menu gracefully for frontend
      return res.json({ status: 'success', data: { items: [] } });
    }
    throw error;
  }
});

exports.createMenu = asyncHandler(async (req, res) => {
  const id = await menusService.createMenu(req.body);
  res.status(201).json({
    status: 'success',
    data: { id },
    message: 'Menu created successfully'
  });
});

exports.updateMenu = asyncHandler(async (req, res) => {
  await menusService.updateMenu(req.params.id, req.body);
  res.json({
    status: 'success',
    message: 'Menu updated successfully'
  });
});

exports.deleteMenu = asyncHandler(async (req, res) => {
  await menusService.deleteMenu(req.params.id);
  res.json({
    status: 'success',
    message: 'Menu deleted successfully'
  });
});

exports.syncMenuItems = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ status: 'error', message: 'Items must be an array' });
  }

  await menusService.syncMenuItems(req.params.id, items);
  res.json({
    status: 'success',
    message: 'Menu structure synced successfully'
  });
});

exports.searchEntities = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const results = await menusService.searchEntities(q);
  res.json({
    status: 'success',
    data: results
  });
});
