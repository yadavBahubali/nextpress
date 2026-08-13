const db = require('../../config/db');

class EcommerceRepository {
  /**
   * Categories
   */
  async getAllCategories() {
    const [rows] = await db.pool.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  }

  async findCategoryBySlug(slug) {
    const [rows] = await db.pool.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    return rows[0];
  }

  async createCategory(data) {
    const { name, slug, description, parent_id } = data;
    const [result] = await db.pool.query(
      'INSERT INTO categories (name, slug, description, parent_id) VALUES (?, ?, ?, ?)',
      [name, slug, description || '', parent_id || null]
    );
    return result.insertId;
  }

  async updateCategory(id, data) {
    // Column names can't be bound with `?`, and `data` comes straight from the
    // request body, so keys must be checked against an allow-list before
    // being interpolated into the SQL - otherwise an attacker-supplied JSON
    // key (not just its value) becomes part of the query.
    const allowedColumns = ['name', 'slug', 'description', 'parent_id'];
    const fields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      if (!allowedColumns.includes(key)) return;
      fields.push(`\`${key}\` = ?`);
      values.push(value);
    });

    if (fields.length > 0) {
      values.push(id);
      await db.pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  }

  async deleteCategory(id) {
    await db.pool.query('DELETE FROM categories WHERE id = ?', [id]);
  }

  /**
   * Products
   */
  async getAllProducts(filters = {}) {
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    const values = [];

    if (filters.category_id) {
      query += ' WHERE p.category_id = ?';
      values.push(filters.category_id);
    }

    query += ' ORDER BY p.created_at DESC';
    const [rows] = await db.pool.query(query, values);
    return rows;
  }

  async findProductBySlug(slug) {
    const [rows] = await db.pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.slug = ?`,
      [slug]
    );
    return rows[0];
  }
  
  async findProductById(id) {
    const [rows] = await db.pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  }

  async createProduct(data) {
    const { name, slug, description, short_description, price, sale_price, sku, stock_quantity, status, category_id, featured_image_id } = data;
    const [result] = await db.pool.query(
      `INSERT INTO products 
       (name, slug, description, short_description, price, sale_price, sku, stock_quantity, status, category_id, featured_image_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description || null, short_description || null, price || 0, sale_price || null, sku || null, stock_quantity || 0, status || 'draft', category_id || null, featured_image_id || null]
    );
    return result.insertId;
  }

  async updateProduct(id, data) {
    // Same allow-list requirement as updateCategory (see comment above) -
    // column names come from the request body and can't be bound with `?`.
    const allowedColumns = [
      'name', 'slug', 'description', 'short_description', 'price', 'sale_price',
      'sku', 'stock_quantity', 'status', 'category_id', 'featured_image_id'
    ];
    const fields = [];
    const values = [];

    Object.entries(data).forEach(([key, value]) => {
      if (!allowedColumns.includes(key)) return;
      fields.push(`\`${key}\` = ?`);
      values.push(value);
    });

    if(fields.length > 0) {
      values.push(id);
      await db.pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    }
  }

  async deleteProduct(id) {
    await db.pool.query('DELETE FROM products WHERE id = ?', [id]);
  }

  /**
   * Orders
   */
  async getAllOrders() {
    const [rows] = await db.pool.query(`
      SELECT o.*, u.name as user_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    return rows;
  }

  async getOrderById(id) {
    const [rows] = await db.pool.query(`
      SELECT o.*, u.name as user_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.id = ?
    `, [id]);
    
    if (rows.length === 0) return null;
    const order = rows[0];

    const [items] = await db.pool.query(`
      SELECT oi.*, p.name as product_name, p.slug as product_slug 
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    order.items = items;
    return order;
  }

  async updateOrderStatus(id, status) {
    await db.pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  }

  async updatePaymentStatus(id, payment_status) {
    await db.pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [payment_status, id]);
  }

  /**
   * Customers (Derived from users with orders or specific roles)
   */
  async getAllCustomers() {
    const [rows] = await db.pool.query(`
      SELECT u.id, u.name, u.email, u.created_at,
             COUNT(o.id) as total_orders,
             SUM(o.total_amount) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role_id = 4 OR o.id IS NOT NULL -- role_id 4 is typically 'viewer'/'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  }
}

module.exports = new EcommerceRepository();
