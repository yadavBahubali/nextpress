const ecommerceService = require('./ecommerce.service');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * Categories
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await ecommerceService.getAllCategories();
  res.json({
    status: 'success',
    data: categories
  });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const id = await ecommerceService.createCategory(req.body);
  res.status(201).json({
    status: 'success',
    data: { id }
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  await ecommerceService.updateCategory(req.params.id, req.body);
  res.json({
    status: 'success',
    message: 'Category updated successfully'
  });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await ecommerceService.deleteCategory(req.params.id);
  res.json({
    status: 'success',
    message: 'Category deleted successfully'
  });
});

/**
 * Products
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const products = await ecommerceService.getAllProducts(req.query);
  res.json({
    status: 'success',
    data: products
  });
});

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await ecommerceService.getProductBySlug(req.params.slug);
  res.json({
    status: 'success',
    data: product
  });
});

exports.getProductById = asyncHandler(async (req, res) => {
  const product = await ecommerceService.getProductById(req.params.id);
  res.json({
    status: 'success',
    data: product
  });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const id = await ecommerceService.createProduct(req.body);
  res.status(201).json({
    status: 'success',
    data: { id }
  });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  await ecommerceService.updateProduct(req.params.id, req.body);
  res.json({
    status: 'success',
    message: 'Product updated successfully'
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await ecommerceService.deleteProduct(req.params.id);
  res.json({
    status: 'success',
    message: 'Product deleted successfully'
  });
});

/**
 * Orders
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await ecommerceService.getAllOrders();
  res.json({
    status: 'success',
    data: orders
  });
});

exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await ecommerceService.getOrderById(req.params.id);
  res.json({
    status: 'success',
    data: order
  });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  await ecommerceService.updateOrderStatus(req.params.id, req.body.status);
  res.json({
    status: 'success',
    message: 'Order status updated'
  });
});

exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  await ecommerceService.updatePaymentStatus(req.params.id, req.body.payment_status);
  res.json({
    status: 'success',
    message: 'Payment status updated'
  });
});

/**
 * Customers
 */
exports.getCustomers = asyncHandler(async (req, res) => {
  const customers = await ecommerceService.getAllCustomers();
  res.json({
    status: 'success',
    data: customers
  });
});
