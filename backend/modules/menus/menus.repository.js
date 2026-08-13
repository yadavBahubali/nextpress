const db = require('../../config/db');

class MenusRepository {
  /**
   * Get all menus
   */
  async findAll() {
    const [rows] = await db.pool.query('SELECT * FROM menus ORDER BY name ASC');
    return rows;
  }

  /**
   * Find menu by ID
   */
  async findById(id) {
    const [rows] = await db.pool.query('SELECT * FROM menus WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Find menu by Slug
   */
  async findBySlug(slug) {
    const [rows] = await db.pool.query('SELECT * FROM menus WHERE slug = ?', [slug]);
    return rows[0] || null;
  }

  /**
   * Find menu by Location
   */
  async findByLocation(location) {
    const [rows] = await db.pool.query('SELECT * FROM menus WHERE location = ?', [location]);
    return rows[0] || null;
  }

  /**
   * Find menu items by menu ID
   */
  async findItemsByMenuId(menuId) {
    const [rows] = await db.pool.query(
      'SELECT * FROM menu_items WHERE menu_id = ? ORDER BY sort_order ASC', 
      [menuId]
    );
    return rows;
  }

  /**
   * Create a new menu
   */
  async create(data) {
    const { name, slug, location, settings_json } = data;
    const [result] = await db.pool.query(
      'INSERT INTO menus (name, slug, location, settings_json) VALUES (?, ?, ?, ?)',
      [name, slug, location || null, settings_json ? JSON.stringify(settings_json) : null]
    );
    return result.insertId;
  }

  /**
   * Update an existing menu
   */
  async update(id, data) {
    const { name, slug, location, settings_json } = data;
    const [result] = await db.pool.query(
      'UPDATE menus SET name = ?, slug = ?, location = ?, settings_json = ? WHERE id = ?',
      [name, slug, location || null, settings_json ? JSON.stringify(settings_json) : null, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete a menu
   */
  async delete(id) {
    const [result] = await db.pool.query('DELETE FROM menus WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Sync menu items (Transactional bulk operation)
   * Deletes all existing and re-inserts to maintain perfect hierarchy and sort order.
   */
  async syncItems(menuId, items) {
    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 1. Delete all existing items for this menu
      await connection.query('DELETE FROM menu_items WHERE menu_id = ?', [menuId]);
      
      // 2. We need a safe way to insert parents before children
      // First, build a map to find children quickly
      const childrenMap = new Map(); // parent_id -> array of items
      const roots = [];
      
      for (const item of items) {
        const parentId = item.parent_id;
        if (parentId) {
          if (!childrenMap.has(parentId)) {
            childrenMap.set(parentId, []);
          }
          childrenMap.get(parentId).push(item);
        } else {
          roots.push(item);
        }
      }
      
      // Recursive function to insert items
      const insertItem = async (item, actualParentId) => {
        const { id: originalId, type, entity_id, label, url, sort_order, settings_json } = item;
        
        // Insert this item
        const [res] = await connection.query(
          `INSERT INTO menu_items (menu_id, parent_id, type, entity_id, label, url, sort_order, settings_json) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            menuId, 
            actualParentId, 
            type, 
            entity_id || null, 
            label, 
            url || null, 
            sort_order || 0, 
            settings_json ? JSON.stringify(settings_json) : null
          ]
        );
        
        const newDbId = res.insertId;
        
        // If this item had children in the original array, insert them now with the new DB ID
        if (childrenMap.has(originalId)) {
          const children = childrenMap.get(originalId);
          for (const child of children) {
            await insertItem(child, newDbId);
          }
        }
      };
      
      // 3. Start by inserting root items
      for (const root of roots) {
        await insertItem(root, null);
      }

      await connection.commit();
      return true;
    } catch (error) {
      console.error("Error in syncItems:", error);
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Search entities for menu building (Pages, Posts, Products)
   */
  async searchEntities(query) {
    // This is a complex query across multiple tables
    if (!query) {
      // Return 10 most recent if no query
      const [pages] = await db.pool.query(
        `SELECT id, title, slug, 'page' as type FROM pages ORDER BY created_at DESC LIMIT 10`
      );
      
      const [posts] = await db.pool.query(
        `SELECT id, title, slug, 'blog' as type FROM posts ORDER BY created_at DESC LIMIT 10`
      );

      return { pages, posts };
    }

    const likeQuery = `%${query}%`;
    
    const [pages] = await db.pool.query(
      `SELECT id, title, slug, 'page' as type FROM pages WHERE title LIKE ? OR slug LIKE ? LIMIT 10`,
      [likeQuery, likeQuery]
    );
    
    const [posts] = await db.pool.query(
      `SELECT id, title, slug, 'blog' as type FROM posts WHERE title LIKE ? OR slug LIKE ? LIMIT 10`,
      [likeQuery, likeQuery]
    );

    return {
      pages,
      posts
      // Add products, categories etc here as needed in future
    };
  }
}

module.exports = new MenusRepository();