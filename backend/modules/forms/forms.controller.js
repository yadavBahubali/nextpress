const formsService = require('./forms.service');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Forms Management
 */

exports.getForms = asyncHandler(async (req, res) => {
  const forms = await formsService.getAllForms();
  res.json({
    status: 'success',
    data: forms
  });
});

exports.getFormById = asyncHandler(async (req, res) => {
  const form = await formsService.getFormById(req.params.id);
  res.json({
    status: 'success',
    data: form
  });
});

exports.getFormBySlug = asyncHandler(async (req, res) => {
  const form = await formsService.getFormBySlug(req.params.slug);
  res.json({
    status: 'success',
    data: form
  });
});

exports.createForm = asyncHandler(async (req, res) => {
  const id = await formsService.createForm(req.body);
  res.status(201).json({
    status: 'success',
    data: { id }
  });
});

exports.updateForm = asyncHandler(async (req, res) => {
  await formsService.updateForm(req.params.id, req.body);
  res.json({
    status: 'success',
    message: 'Form updated successfully'
  });
});

exports.deleteForm = asyncHandler(async (req, res) => {
  await formsService.deleteForm(req.params.id);
  res.json({
    status: 'success',
    message: 'Form deleted successfully'
  });
});

/**
 * Submissions Management
 */

exports.submitForm = asyncHandler(async (req, res) => {
  const metadata = {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  const result = await formsService.submitForm(req.params.slug, req.body, metadata);
  res.status(201).json({
    status: 'success',
    ...result
  });
});

exports.getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await formsService.getAllSubmissions();
  res.json({
    status: 'success',
    data: submissions
  });
});

exports.getSubmissionsByForm = asyncHandler(async (req, res) => {
    const submissions = await formsService.getSubmissionsByFormId(req.params.formId);
    res.json({
      status: 'success',
      data: submissions
    });
});

exports.getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await formsService.getSubmissionById(req.params.id);
  res.json({
    status: 'success',
    data: submission
  });
});

exports.updateSubmissionStatus = asyncHandler(async (req, res) => {
  await formsService.updateSubmissionStatus(req.params.id, req.body.status);
  res.json({
    status: 'success',
    message: 'Submission status updated'
  });
});

exports.updateSalesStatus = asyncHandler(async (req, res) => {
  await formsService.updateSalesStatus(req.params.id, req.body.sales_status);
  res.json({
    status: 'success',
    message: 'Sales status updated'
  });
});

exports.assignSubmission = asyncHandler(async (req, res) => {
  await formsService.assignSubmission(req.params.id, req.body.user_id);
  res.json({
    status: 'success',
    message: 'Submission assigned successfully'
  });
});

exports.addNote = asyncHandler(async (req, res) => {
  const notes = await formsService.addNoteToSubmission(req.params.id, req.body, req.user);
  res.json({
    status: 'success',
    message: 'Note added successfully',
    data: notes
  });
});

exports.deleteSubmission = asyncHandler(async (req, res) => {
  await formsService.deleteSubmission(req.params.id);
  res.json({
    status: 'success',
    message: 'Submission deleted successfully'
  });
});
