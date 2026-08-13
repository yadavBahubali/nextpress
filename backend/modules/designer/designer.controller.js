const designerRepository = require('./designer.repository');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');

exports.getTemplates = asyncHandler(async (req, res) => {
  const templates = await designerRepository.getTemplates();
  res.status(200).json({
    status: 'success',
    data: templates
  });
});

exports.getRecommendations = asyncHandler(async (req, res) => {
  const { room_type_id, length, seats } = req.body;
  
  if (!room_type_id) {
    throw new ApiError(400, 'Room type is required');
  }

  const recommendations = await designerRepository.getRecommendations(room_type_id, length || 5, seats || 8);
  
  res.status(200).json({
    status: 'success',
    data: recommendations
  });
});

exports.saveConfiguration = asyncHandler(async (req, res) => {
  const configId = await designerRepository.createConfiguration({
    ...req.body,
    user_id: req.user ? req.user.id : null
  });

  res.status(201).json({
    status: 'success',
    data: { id: configId }
  });
});

exports.generateQuotation = asyncHandler(async (req, res) => {
  const { configId } = req.params;
  const config = await designerRepository.getConfigurationById(configId);
  
  if (!config) {
    throw new ApiError(404, 'Configuration not found');
  }

  // Calculate total price from selected products (mock calculation for now)
  const products = JSON.parse(config.selected_products);
  const totalPrice = products.length * 5000; // Mock price

  const quoteId = await designerRepository.createQuotation({
    config_id: configId,
    user_id: req.user ? req.user.id : null,
    total_price: totalPrice
  });

  res.status(201).json({
    status: 'success',
    data: { id: quoteId }
  });
});
