const permissionsService = require('./permissions.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.getSections = asyncHandler(async (req, res) => {
  res.json({ status: 'success', data: await permissionsService.getGrantableSections() });
});

exports.getMine = asyncHandler(async (req, res) => {
  const menuKeys = await permissionsService.getForUser(req.user.id);
  res.json({ status: 'success', data: menuKeys });
});

exports.getForUser = asyncHandler(async (req, res) => {
  const menuKeys = await permissionsService.getForUser(req.params.userId);
  res.json({ status: 'success', data: menuKeys });
});

exports.setForUser = asyncHandler(async (req, res) => {
  const { menuKeys } = req.body;
  if (!Array.isArray(menuKeys)) {
    return res.status(400).json({ status: 'fail', message: 'menuKeys must be an array' });
  }
  const saved = await permissionsService.setForUser(req.params.userId, menuKeys);
  res.json({ status: 'success', data: saved });
});
