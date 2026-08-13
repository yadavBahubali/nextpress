const careersService = require('./careers.service');
const asyncHandler = require('../../utils/asyncHandler');

// --- Dashboard ---

exports.getHrDashboard = asyncHandler(async (req, res) => {
  const stats = await careersService.getHrDashboardStats();
  res.json({ status: 'success', data: stats });
});

// --- Jobs Management ---

exports.getPublicJobs = asyncHandler(async (req, res) => {
  const jobs = await careersService.getPublicJobs();
  res.json({ status: 'success', data: jobs });
});

exports.getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await careersService.getAllJobs();
  res.json({ status: 'success', data: jobs });
});

exports.getJobById = asyncHandler(async (req, res) => {
  const job = await careersService.getJobById(req.params.id);
  res.json({ status: 'success', data: job });
});

exports.getJobBySlug = asyncHandler(async (req, res) => {
  const job = await careersService.getJobBySlug(req.params.slug);
  res.json({ status: 'success', data: job });
});

exports.createJob = asyncHandler(async (req, res) => {
  const id = await careersService.createJob(req.body, req.file);
  res.status(201).json({ status: 'success', data: { id } });
});

exports.updateJob = asyncHandler(async (req, res) => {
  await careersService.updateJob(req.params.id, req.body, req.file);
  res.json({ status: 'success', message: 'Job updated successfully' });
});

exports.deleteJob = asyncHandler(async (req, res) => {
  await careersService.deleteJob(req.params.id);
  res.json({ status: 'success', message: 'Job deleted successfully' });
});

// --- Applications Management ---

exports.submitApplication = asyncHandler(async (req, res) => {
  const applicationId = await careersService.submitApplication(req.params.jobId, req.body, req.file);
  res.status(201).json({
    status: 'success',
    message: 'Application submitted successfully',
    data: { id: applicationId }
  });
});

exports.getAllApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.query;
  const applications = await careersService.getAllApplications(jobId);
  res.json({ status: 'success', data: applications });
});

exports.getApplicationById = asyncHandler(async (req, res) => {
  const application = await careersService.getApplicationById(req.params.id);
  res.json({ status: 'success', data: application });
});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  await careersService.updateApplicationStatus(req.params.id, req.body.status);
  res.json({ status: 'success', message: 'Application status updated' });
});

exports.addApplicationNote = asyncHandler(async (req, res) => {
  const notes = await careersService.addNoteToApplication(req.params.id, req.body.text, req.user);
  res.json({ status: 'success', message: 'Note added successfully', data: notes });
});

exports.deleteApplication = asyncHandler(async (req, res) => {
  await careersService.deleteApplication(req.params.id);
  res.json({ status: 'success', message: 'Application deleted successfully' });
});
