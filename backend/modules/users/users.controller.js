const usersService = require('./users.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const users = await usersService.getAllUsers();
  res.json({
    status: 'success',
    data: users
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  res.json({
    status: 'success',
    data: user
  });
});

exports.create = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.body, req.user);
  res.status(201).json({
    status: 'success',
    data: user
  });
});

exports.update = asyncHandler(async (req, res) => {
  const user = await usersService.updateUser(req.params.id, req.body, req.user);
  res.json({
    status: 'success',
    data: user
  });
});

exports.delete = asyncHandler(async (req, res) => {
  await usersService.deleteUser(req.params.id);
  res.json({
    status: 'success',
    message: 'User deleted successfully'
  });
});
