const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const { protect } = require('../../middleware/authMiddleware');

// All profile routes require authentication
router.use(protect);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

router.get('/addresses', profileController.getAddresses);
router.post('/addresses', profileController.addAddress);
router.put('/addresses/:id', profileController.updateAddress);
router.delete('/addresses/:id', profileController.deleteAddress);
router.put('/addresses/:id/default', profileController.setDefaultAddress);

module.exports = router;
