const cptService = require('./cpt.service');
const asyncHandler = require('../../utils/asyncHandler');

// --- Post Types (registry) ---

exports.getAllTypes = asyncHandler(async (req, res) => {
  const types = await cptService.getAllTypes();
  res.json({ status: 'success', data: types });
});

exports.getActiveTypes = asyncHandler(async (req, res) => {
  const types = await cptService.getActiveTypes();
  res.json({ status: 'success', data: types });
});

exports.createType = asyncHandler(async (req, res) => {
  const type = await cptService.createType(req.body);
  res.status(201).json({ status: 'success', data: type });
});

exports.updateType = asyncHandler(async (req, res) => {
  const type = await cptService.updateType(req.params.id, req.body);
  res.json({ status: 'success', data: type });
});

exports.deleteType = asyncHandler(async (req, res) => {
  await cptService.deleteType(req.params.id);
  res.json({ status: 'success', message: 'Post type deleted successfully' });
});

// --- Entries ---

exports.getEntries = asyncHandler(async (req, res) => {
  const entries = await cptService.getEntries(req.params.postType, req.query, req.user);
  res.json({ status: 'success', data: entries });
});

exports.getMyEntries = asyncHandler(async (req, res) => {
  const entries = await cptService.getMyEntries(req.params.postType, req.user.id);
  res.json({ status: 'success', data: entries });
});

exports.getMyEntryById = asyncHandler(async (req, res) => {
  const entry = await cptService.getMyEntryById(req.params.id, req.user.id);
  res.json({ status: 'success', data: entry });
});

exports.updateMyEntry = asyncHandler(async (req, res) => {
  await cptService.updateMyEntry(req.params.id, req.user.id, req.body.content_json);
  res.json({ status: 'success', message: 'Entry updated successfully' });
});

exports.getPublicEntries = asyncHandler(async (req, res) => {
  const entries = await cptService.getPublicEntries(req.params.postType);
  res.json({ status: 'success', data: entries });
});

exports.getEntryById = asyncHandler(async (req, res) => {
  const entry = await cptService.getEntryById(req.params.id, req.user);
  res.json({ status: 'success', data: entry });
});

exports.getEntryBySlug = asyncHandler(async (req, res) => {
  const entry = await cptService.getEntryBySlug(req.params.postType, req.params.slug);
  res.json({ status: 'success', data: entry });
});

exports.createEntry = asyncHandler(async (req, res) => {
  const id = await cptService.createEntry(req.params.postType, req.body, req.user.id);
  res.status(201).json({ status: 'success', data: { id } });
});

exports.updateEntry = asyncHandler(async (req, res) => {
  await cptService.updateEntry(req.params.id, req.body);
  res.json({ status: 'success', message: 'Entry updated successfully' });
});

exports.deleteEntry = asyncHandler(async (req, res) => {
  await cptService.deleteEntry(req.params.id);
  res.json({ status: 'success', message: 'Entry deleted successfully' });
});
