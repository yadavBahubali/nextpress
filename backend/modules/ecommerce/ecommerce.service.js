const ecommerceRepository = require('./ecommerce.repository');
const acfService = require('../acf/acf.service');
const ApiError = require('../../utils/ApiError');

class EcommerceService {
  /**
   * Categories
   */
  async getAllCategories() {
    return await ecommerceRepository.getAllCategories();
  }

  async getCategoryBySlug(slug) {
    const category = await ecommerceRepository.findCategoryBySlug(slug);
    if (!category) throw new ApiError(404, 'Category not found');
    return category;
  }

  async createCategory(data) {
    if (!data.name || !data.slug) throw new ApiError(400, 'Name and slug are required');
    const existing = await ecommerceRepository.findCategoryBySlug(data.slug);
    if (existing) throw new ApiError(400, 'Category slug already exists');
    return await ecommerceRepository.createCategory(data);
  }

  async updateCategory(id, data) {
    if (data.slug) {
      const category = await ecommerceRepository.findCategoryBySlug(data.slug);
      if (category && category.id !== parseInt(id)) throw new ApiError(400, 'Category slug already exists');
    }
    return await ecommerceRepository.updateCategory(id, data);
  }

  async deleteCategory(id) {
    return await ecommerceRepository.deleteCategory(id);
  }

  /**
   * Products
   */
  async getAllProducts(filters) {
    return await ecommerceRepository.getAllProducts(filters);
  }

  async getProductBySlug(slug) {
    const product = await ecommerceRepository.findProductBySlug(slug);
    if (!product) throw new ApiError(404, 'Product not found');

    const acf = await acfService.getMergedAcfData('product', product.id);

    return {
      ...product,
      acf
    };
  }

  async getProductById(id) {
    const product = await ecommerceRepository.findProductById(id);
    if (!product) throw new ApiError(404, 'Product not found');
    
    const acf = await acfService.getMergedAcfData('product', id);
    return {
      ...product,
      acf
    };
  }

  async createProduct(data) {
    if (!data.name || !data.slug) throw new ApiError(400, 'Name and slug are required');
    const existing = await ecommerceRepository.findProductBySlug(data.slug);
    if (existing) throw new ApiError(400, 'Product slug already exists');
    return await ecommerceRepository.createProduct(data);
  }

  async updateProduct(id, data) {
    if (data.slug) {
      const existing = await ecommerceRepository.findProductBySlug(data.slug);
      if (existing && existing.id !== parseInt(id)) throw new ApiError(400, 'Product slug already exists');
    }
    return await ecommerceRepository.updateProduct(id, data);
  }

  async deleteProduct(id) {
    return await ecommerceRepository.deleteProduct(id);
  }

  /**
   * Orders
   */
  async getAllOrders() {
    return await ecommerceRepository.getAllOrders();
  }

  async getOrderById(id) {
    const order = await ecommerceRepository.getOrderById(id);
    if (!order) throw new ApiError(404, 'Order not found');
    return order;
  }

  async updateOrderStatus(id, status) {
    return await ecommerceRepository.updateOrderStatus(id, status);
  }

  async updatePaymentStatus(id, payment_status) {
    return await ecommerceRepository.updatePaymentStatus(id, payment_status);
  }

  /**
   * Customers
   */
  async getAllCustomers() {
    return await ecommerceRepository.getAllCustomers();
  }
}

module.exports = new EcommerceService();
