const db = require('../../config/db');

class PageRepository {
  /**
   * Get all pages
   */
  async getAllPages() {
    return await db.pool.query(`
      SELECT p.*, m.path as featured_image_url 
      FROM pages p 
      LEFT JOIN media m ON p.featured_image_id = m.id 
      ORDER BY p.created_at DESC
    `).then(([rows]) => rows);
  }

  /**
   * Get all published pages
   */
  async getPublicPages() {
    return await db.pool.query(`
      SELECT p.id, p.title, p.slug, p.updated_at 
      FROM pages p 
      WHERE p.status = 'published'
      ORDER BY p.updated_at DESC
    `).then(([rows]) => rows);
  }

  /**
   * Find page by slug
   */
  async findBySlug(slug) {
    return await db.pool.query(`
      SELECT p.*, m.path as featured_image_url 
      FROM pages p 
      LEFT JOIN media m ON p.featured_image_id = m.id 
      WHERE p.slug = ?
    `, [slug]).then(([rows]) => rows[0]);
  }

  /**
   * Find page by slug excluding a specific ID (for uniqueness check)
   */
  async findBySlugExcludingId(slug, id) {
    return await db.pool.query(`
      SELECT p.*, m.path as featured_image_url 
      FROM pages p 
      LEFT JOIN media m ON p.featured_image_id = m.id 
      WHERE p.slug = ? AND p.id != ?
    `, [slug, id]).then(([rows]) => rows[0]);
  }

  /**
   * Find page by ID
   */
  async findById(id) {
    return await db.pool.query(`
      SELECT p.*, m.path as featured_image_url 
      FROM pages p 
      LEFT JOIN media m ON p.featured_image_id = m.id 
      WHERE p.id = ?
    `, [id]).then(([rows]) => rows[0]);
  }

  /**
   * Create a new page
   */
  async create(data) {
    const result = await db.insert('pages', {
      internal_name: data.title,
      title: data.title,
      seo_title: data.seo_title || data.title,
      slug: data.slug,
      description: data.description || null,
      template: data.template || 'default',
      content_json: data.content_json ? JSON.stringify(data.content_json) : null,
      seo_meta: data.seo_meta ? JSON.stringify(data.seo_meta) : null,
      status: data.status || 'draft',
      parent_id: data.parent_id || null,
      featured_image_id: data.featured_image_id || null
    });
    return result.insert_id;
  }

  /**
   * Update a page
   */
  async update(id, data) {
    const updateData = { ...data };
    
    if (updateData.title) {
      updateData.internal_name = updateData.title;
    }

    if (updateData.content_json) {
      updateData.content_json = JSON.stringify(updateData.content_json);
    }
    if (updateData.seo_meta) {
      updateData.seo_meta = JSON.stringify(updateData.seo_meta);
    }

    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    await db.update('pages', updateData, `id = ?`, [id]);
  }

  /**
   * Delete a page
   */
  async delete(id) {
    await db.delete('pages', `id = ?`, [id]);
  }

  /**
   * Page Sections
   */
  async getSectionsByPageId(pageId) {
    return await db.selectAll('page_sections', '*', `page_id = ?`, 'ORDER BY order_index ASC', [pageId]);
  }

  async createSection(data) {
    const result = await db.insert('page_sections', {
      page_id: data.page_id,
      section_type: data.section_type,
      content: JSON.stringify(data.content || {}),
      order_index: data.order_index || 0
    });
    return result.insert_id;
  }

  async deleteSectionsByPageId(pageId) {
    await db.delete('page_sections', `page_id = ?`, [pageId]);
  }
}

module.exports = new PageRepository();
