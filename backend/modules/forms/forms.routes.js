const express = require('express');
const router = express.Router();
const formsController = require('./forms.controller');
const { protect, authorizeSection } = require('../../middleware/authMiddleware');
const { publicSubmissionLimiter } = require('../../middleware/rateLimiter');
const { validateDynamicObjectBody } = require('../../middleware/validate');

// Public routes.
// Form fields are defined dynamically per-form by an admin (form builder),
// so a fixed schema isn't possible here - validateDynamicObjectBody instead
// enforces basic sanity (must be a non-empty object, bounded field count,
// bounded field length) before the submission reaches the database.
router.post('/submit/:slug', publicSubmissionLimiter, validateDynamicObjectBody(), formsController.submitForm);
router.get('/public/:slug', formsController.getFormBySlug);

// Admin routes (Forms builder + Submissions/leads). Super Admin/Admin always
// have full access; Editor/Staff Viewer need an explicit grant for the
// relevant section (see modules/permissions), and Staff Viewer is blocked
// from anything but GET regardless of section, via authorizeSection.
router.use(protect);

// Form builder (defining forms/fields) - a CMS Management concern.
router.get('/', authorizeSection('cms.forms'), formsController.getForms);
router.get('/:id', authorizeSection('cms.forms'), formsController.getFormById);
router.post('/', authorizeSection('cms.forms'), formsController.createForm);
router.put('/:id', authorizeSection('cms.forms'), formsController.updateForm);
router.delete('/:id', authorizeSection('cms.forms'), formsController.deleteForm);

// Submissions/leads - a Sales & Leads concern.
router.get('/submissions/all', authorizeSection('sales.leads'), formsController.getSubmissions);
router.get('/submissions/form/:formId', authorizeSection('sales.leads'), formsController.getSubmissionsByForm);
router.get('/submissions/:id', authorizeSection('sales.leads'), formsController.getSubmissionById);
router.put('/submissions/:id/status', authorizeSection('sales.leads'), formsController.updateSubmissionStatus);
router.put('/submissions/:id/sales-status', authorizeSection('sales.leads'), formsController.updateSalesStatus);
router.put('/submissions/:id/assign', authorizeSection('sales.leads'), formsController.assignSubmission);
router.post('/submissions/:id/notes', authorizeSection('sales.leads'), formsController.addNote);
router.delete('/submissions/:id', authorizeSection('sales.leads'), formsController.deleteSubmission);

module.exports = router;
