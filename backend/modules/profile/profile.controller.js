const profileService = require('./profile.service');
const asyncHandler = require('../../utils/asyncHandler');

class ProfileController {
  getProfile = asyncHandler(async (req, res) => {
    const user = await profileService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  });

  updateProfile = asyncHandler(async (req, res) => {
    await profileService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  });

  getAddresses = asyncHandler(async (req, res) => {
    const addresses = await profileService.getAddresses(req.user.id);
    res.status(200).json({
      success: true,
      data: addresses
    });
  });

  addAddress = asyncHandler(async (req, res) => {
    const result = await profileService.addAddress(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: { id: result.insertId },
      message: 'Address added successfully'
    });
  });

  updateAddress = asyncHandler(async (req, res) => {
    await profileService.updateAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Address updated successfully'
    });
  });

  deleteAddress = asyncHandler(async (req, res) => {
    await profileService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  });

  setDefaultAddress = asyncHandler(async (req, res) => {
    await profileService.setDefaultAddress(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Default address updated successfully'
    });
  });
}

module.exports = new ProfileController();
