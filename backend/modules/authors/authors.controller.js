const authorsService = require('./authors.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const authors = await authorsService.getAllAuthors();
  res.json({
    status: 'success',
    data: authors
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const author = await authorsService.getAuthorById(req.params.id);
  res.json({
    status: 'success',
    data: author
  });
});

exports.create = asyncHandler(async (req, res) => {
  const author = await authorsService.createAuthor(req.body);
  res.status(201).json({
    status: 'success',
    data: author
  });
});

exports.update = asyncHandler(async (req, res) => {
  const author = await authorsService.updateAuthor(req.params.id, req.body);
  res.json({
    status: 'success',
    data: author
  });
});

exports.delete = asyncHandler(async (req, res) => {
  await authorsService.deleteAuthor(req.params.id);
  res.json({
    status: 'success',
    message: 'Author deleted successfully'
  });
});
