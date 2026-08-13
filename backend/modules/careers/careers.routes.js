const express = require('express');
const router = express.Router();
const careersController = require('./careers.controller');
const { protect, authorizeSection } = require('../../middleware/authMiddleware');
const { uploadDocument, uploadAttachment } = require('../../middleware/uploadMiddleware');
const { publicSubmissionLimiter } = require('../../middleware/rateLimiter');
const { validateBody } = require('../../middleware/validate');
const { applicationSchema } = require('./careers.validation');

// Public routes
router.get('/jobs/public', careersController.getPublicJobs);
router.get('/jobs/slug/:slug', careersController.getJobBySlug);
// uploadDocument must run first: it's the multer middleware that parses the
// multipart body into req.body (text fields) + req.file (the resume) before
// validation can inspect req.body.
router.post(
  '/apply/:jobId',
  publicSubmissionLimiter,
  uploadDocument,
  validateBody(applicationSchema),
  careersController.submitApplication
);

// Admin/HR routes (Jobs + Applications, which include resumes/PII). Super
// Admin/Admin always have full access; Editor/Staff Viewer need an explicit
// grant (see modules/permissions) - previously this was Admin-only with no
// way to extend access to anyone else at all.
router.use(protect);

router.get('/dashboard', authorizeSection('hr.dashboard'), careersController.getHrDashboard);

router.get('/jobs', authorizeSection('hr.jobs'), careersController.getAllJobs);
router.get('/jobs/:id', authorizeSection('hr.jobs'), careersController.getJobById);
router.post('/jobs', authorizeSection('hr.jobs'), uploadAttachment, careersController.createJob);
router.put('/jobs/:id', authorizeSection('hr.jobs'), uploadAttachment, careersController.updateJob);
router.delete('/jobs/:id', authorizeSection('hr.jobs'), careersController.deleteJob);

router.get('/applications', authorizeSection('hr.applications'), careersController.getAllApplications);
router.get('/applications/:id', authorizeSection('hr.applications'), careersController.getApplicationById);
router.put('/applications/:id/status', authorizeSection('hr.applications'), careersController.updateApplicationStatus);
router.post('/applications/:id/notes', authorizeSection('hr.applications'), careersController.addApplicationNote);
router.delete('/applications/:id', authorizeSection('hr.applications'), careersController.deleteApplication);

module.exports = router;
