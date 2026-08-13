const express = require('express');
const designerController = require('./designer.controller');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/templates', designerController.getTemplates);
router.post('/recommendations', designerController.getRecommendations);

// Protected routes (optional, can be public for lead gen)
router.post('/configurations', designerController.saveConfiguration);
router.post('/quotations/:configId', designerController.generateQuotation);

module.exports = router;
