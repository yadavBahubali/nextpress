const mediaService = require('./media.service');
const asyncHandler = require('../../utils/asyncHandler');

exports.upload = asyncHandler(async (req, res) => {
  console.log('Upload request received');
  console.log('req.files:', req.files ? req.files.length : 'none');
  console.log('req.file:', req.file ? 'present' : 'none');

  if (req.files && req.files.length > 0) {
    const result = await mediaService.uploadFiles(req.files);
    console.log('Batch upload result:', result.length, 'items');
    return res.status(201).json({
      success: true,
      data: result
    });
  }
  
  if (req.file) {
    const result = await mediaService.uploadFile(req.file);
    console.log('Single upload result ID:', result.id);
    return res.status(201).json({
      success: true,
      data: result
    });
  }

  throw new ApiError(400, 'No files provided in request');
});

exports.uploadImage = asyncHandler(async (req, res) => {
  const result = await mediaService.uploadFile(req.file);
  res.status(201).json({
    success: true,
    data: result
  });
});

exports.uploadVideo = asyncHandler(async (req, res) => {
  const result = await mediaService.uploadFile(req.file);
  res.status(201).json({
    success: true,
    data: result
  });
});

exports.getAll = asyncHandler(async (req, res) => {
  const media = await mediaService.getAllMedia();
  res.json({
    success: true,
    data: media
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const media = await mediaService.getMediaById(req.params.id);
  res.json({
    success: true,
    data: media
  });
});

exports.delete = asyncHandler(async (req, res) => {
  await mediaService.deleteMedia(req.params.id);
  res.json({
    success: true,
    message: 'Media deleted successfully'
  });
});

exports.update = asyncHandler(async (req, res) => {
  const result = await mediaService.updateMedia(req.params.id, req.body);
  res.json({
    success: true,
    data: result,
    message: 'Media metadata updated successfully'
  });
});
