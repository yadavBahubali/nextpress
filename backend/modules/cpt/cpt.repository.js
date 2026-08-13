const db = require('../../config/db');

class CptRepository {
  // --- Post Types (the CPT registry) ---

  async getAllTypes() {
    return await db.selectAll('post_types', '*', '', 'ORDER BY label ASC');
  }

  async getActiveTypes() {
    return await db.selectAll('post_types', '*', 'is_active = 1', 'ORDER BY label ASC');
  }

  async getTypeBySlug(slug) {
    return await db.select('post_types', '*', 'slug = ?', [slug]);
  }

  async getTypeById(id) {
    return await db.select('post_types', '*', 'id = ?', [id]);
  }

  async createType(data) {
    const result = await db.insert('post_types', {
      slug: data.slug,
      label: data.label,
      singular_label: data.singular_label,
      icon: data.icon || null,
      description: data.description || null,
      is_public: data.is_public !== undefined ? (data.is_public ? 1 : 0) : 1,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
    });
    return result.insert_id;
  }

  async updateType(id, data) {
    const updateData = {};
    ['slug', 'label', 'singular_label', 'icon', 'description'].forEach((field) => {
      if (data[field] !== undefined) updateData[field] = data[field];
    });
    if (data.is_public !== undefined) updateData.is_public = data.is_public ? 1 : 0;
    if (data.is_active !== undefined) updateData.is_active = data.is_active ? 1 : 0;

    if (Object.keys(updateData).length === 0) return { status: true };
    return await db.update('post_types', updateData, 'id = ?', [id]);
  }

  async deleteType(id) {
    // ON DELETE CASCADE on cpt_entries.post_type_id removes its entries too.
    return await db.delete('post_types', 'id = ?', [id]);
  }

  // --- Entries (rows within a post type, e.g. one Industry) ---

  async getEntries(postTypeId, { status } = {}) {
    let where = 'e.post_type_id = ?';
    const params = [postTypeId];
    if (status) {
      where += ' AND e.status = ?';
      params.push(status);
    }

    const query = `
      SELECT e.*, m.path as featured_image_path, u.name as author_name
      FROM cpt_entries e
      LEFT JOIN media m ON e.featured_image_id = m.id
      LEFT JOIN users u ON e.author_id = u.id
      WHERE ${where}
      ORDER BY e.order_index ASC, e.created_at DESC
    `;
    return await db.query_All(query, params);
  }

  async getPublicEntries(postTypeId) {
    const query = `
      SELECT e.id, e.post_type_id, e.title, e.slug, e.featured_image_id,
             m.path as featured_image_path, e.order_index, e.updated_at
      FROM cpt_entries e
      LEFT JOIN media m ON e.featured_image_id = m.id
      WHERE e.post_type_id = ? AND e.status = 'published'
      ORDER BY e.order_index ASC, e.created_at DESC
    `;
    return await db.query_All(query, [postTypeId]);
  }

  async findById(id) {
    const query = `
      SELECT e.*, m.path as featured_image_path
      FROM cpt_entries e
      LEFT JOIN media m ON e.featured_image_id = m.id
      WHERE e.id = ?
    `;
    const rows = await db.query_All(query, [id]);
    return rows[0];
  }

  async findBySlug(postTypeId, slug) {
    const query = `
      SELECT e.*, m.path as featured_image_path
      FROM cpt_entries e
      LEFT JOIN media m ON e.featured_image_id = m.id
      WHERE e.post_type_id = ? AND e.slug = ?
    `;
    const rows = await db.query_All(query, [postTypeId, slug]);
    return rows[0];
  }

  async findBySlugExcludingId(postTypeId, slug, excludeId) {
    return await db.select(
      'cpt_entries',
      'id',
      'post_type_id = ? AND slug = ? AND id != ?',
      [postTypeId, slug, excludeId]
    );
  }

  async create(data) {
    const result = await db.insert('cpt_entries', {
      post_type_id: data.post_type_id,
      title: data.title,
      slug: data.slug,
      status: data.status || 'draft',
      featured_image_id: data.featured_image_id || null,
      content_json:
        data.content_json !== undefined && data.content_json !== null
          ? (typeof data.content_json === 'string' ? data.content_json : JSON.stringify(data.content_json))
          : null,
      order_index: data.order_index || 0,
      author_id: data.author_id || null,
    });
    return result.insert_id;
  }

  async update(id, data) {
    const updateData = {};
    ['title', 'slug', 'status', 'featured_image_id', 'order_index'].forEach((field) => {
      if (data[field] !== undefined) updateData[field] = data[field];
    });
    if (data.content_json !== undefined) {
      updateData.content_json =
        typeof data.content_json === 'string' ? data.content_json : JSON.stringify(data.content_json);
    }

    if (Object.keys(updateData).length === 0) return { status: true };
    return await db.update('cpt_entries', updateData, 'id = ?', [id]);
  }

  async delete(id) {
    return await db.delete('cpt_entries', 'id = ?', [id]);
  }
}

module.exports = new CptRepository();
