const express = require('express');
const router = express.Router();
const ecommerceController = require('./ecommerce.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

// Public routes
router.get('/products', ecommerceController.getProducts);
router.get('/products/slug/:slug', ecommerceController.getProductBySlug);
router.get('/categories', ecommerceController.getCategories);

// Admin routes - restricted to Super Admin / Admin. Previously only `protect`
// was required, so any authenticated customer could view every order/
// customer record and change order/payment status.
router.use(protect);
router.use(authorize(1, 2));

// Products
router.get('/products/:id', ecommerceController.getProductById);
router.post('/products', ecommerceController.createProduct);
router.put('/products/:id', ecommerceController.updateProduct);
router.delete('/products/:id', ecommerceController.deleteProduct);

// Categories
router.post('/categories', ecommerceController.createCategory);
router.put('/categories/:id', ecommerceController.updateCategory);
router.delete('/categories/:id', ecommerceController.deleteCategory);

// Orders
router.get('/orders', ecommerceController.getOrders);
router.get('/orders/:id', ecommerceController.getOrderById);
router.put('/orders/:id/status', ecommerceController.updateOrderStatus);
router.put('/orders/:id/payment', ecommerceController.updatePaymentStatus);

// Customers
router.get('/customers', ecommerceController.getCustomers);

module.exports = router;
