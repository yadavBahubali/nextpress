const settingsService = require('./settings.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

// Keys matching this pattern hold credentials/secrets (SMTP passwords, API
// keys, tokens, etc.) and must never be readable by anonymous callers, even
// though GET /settings/:key is otherwise a public endpoint.
const SENSITIVE_KEY_PATTERN = /password|secret|token|api[_-]?key|smtp_(user|pass|host|port|encryption)/i;
const ADMIN_ROLE_IDS = [1, 2];

exports.getAuthorMeta = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meta = await settingsService.getAuthorMeta(id);
  
  res.json({
    status: 'success',
    data: meta || {}
  });
});

exports.saveAuthorMeta = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  
  await settingsService.saveAuthorMeta(id, data);
  
  res.json({
    status: 'success',
    message: 'Author metadata saved successfully'
  });
});

exports.getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const isSensitive = SENSITIVE_KEY_PATTERN.test(key);
  const isAuthorizedAdmin = req.user && ADMIN_ROLE_IDS.includes(req.user.role_id);
  if (isSensitive && !isAuthorizedAdmin) {
    throw new ApiError(403, 'Not authorized to access this setting');
  }

  const value = await settingsService.getSetting(key);

  res.json({
    status: 'success',
    data: value
  });
});

exports.getSettingsByGroup = asyncHandler(async (req, res) => {
  const { group } = req.params;
  const settings = await settingsService.getSettingsByGroup(group);
  
  res.json({
    status: 'success',
    data: settings
  });
});

exports.saveSetting = asyncHandler(async (req, res) => {
  const { key, value, group } = req.body;
  await settingsService.saveSetting(key, value, group);
  
  res.json({
    status: 'success',
    message: 'Setting saved successfully'
  });
});

exports.getSystemModules = asyncHandler(async (req, res) => {
  const modules = await settingsService.getSystemModules();
  res.json({
    status: 'success',
    data: modules
  });
});

exports.updateSystemModules = asyncHandler(async (req, res) => {
  const { modules } = req.body;
  await settingsService.updateSystemModules(modules);
  res.json({
    status: 'success',
    message: 'Modules updated successfully'
  });
});
