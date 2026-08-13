const db = require('../../config/db');

class AcfRepository {
  /**
   * Get paginated and filtered groups
   */
  async getGroups({ limit = 10, offset = 0, search = '' }) {
    let where = 'active = 1';
    const values = [];
    if (search) {
      where += ` AND (title LIKE ? OR group_key LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const groups = await db.selectAll(
      'acf_field_groups',
      '*',
      where,
      `ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      values
    );

    // Get total count for pagination
    const countRows = await db.query_All(
      `SELECT COUNT(*) as total FROM acf_field_groups WHERE ${where}`,
      values
    );

    return {
      groups,
      total: countRows[0].total
    };
  }

  /**
   * Get all active groups (for schema mapping)
   */
  async getAllActiveGroups() {
    return await db.selectAll('acf_field_groups', '*', 'active = 1');
  }

  /**
   * Get a group by ID or UUID
   */
  async getGroup(id) {
    const isUuid = isNaN(id);
    const where = isUuid ? `uuid = ?` : `id = ?`;
    return await db.select('acf_field_groups', '*', where, [id]);
  }

  /**
   * Get a group by its unique key
   */
  async getGroupByKey(key) {
    return await db.select('acf_field_groups', '*', `group_key = ?`, [key]);
  }

  /**
   * Create a new group
   */
  async create(data) {
    return await db.insert('acf_field_groups', {
      uuid: data.uuid,
      title: data.title,
      group_key: data.group_key,
      description: data.description || '',
      active: data.active !== undefined ? data.active : 1,
      page_id: data.page_id || null,
      post_id: data.post_id || null,
      order_index: data.order_index || 0,
      settings: JSON.stringify(data.settings || {}),
      fields: JSON.stringify(data.fields || [])
    });
  }

  /**
   * Update an existing group
   */
  async update(id, data) {
    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.group_key) updateData.group_key = data.group_key;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.page_id !== undefined) updateData.page_id = data.page_id;
    if (data.post_id !== undefined) updateData.post_id = data.post_id;
    if (data.order_index !== undefined) updateData.order_index = data.order_index;
    if (data.settings) updateData.settings = JSON.stringify(data.settings);
    if (data.fields) updateData.fields = JSON.stringify(data.fields);

    return await db.update('acf_field_groups', updateData, `id = ?`, [id]);
  }

  /**
   * Delete a group
   */
  async delete(id) {
    return await db.delete('acf_field_groups', `id = ?`, [id]);
  }

  /**
   * Page Mappings (Simplified to direct column check)
   */
  async getGroupsByPageId(pageId) {
    return await db.selectAll('acf_field_groups', '*', `page_id = ?`, 'ORDER BY order_index ASC', [pageId]);
  }

  async getGroupsByPostId(postId) {
    return await db.selectAll('acf_field_groups', '*', `post_id = ?`, 'ORDER BY order_index ASC', [postId]);
  }

  async getAllGroups() {
    return await db.selectAll('acf_field_groups', '*', 'active = 1');
  }

  // Deprecated mapping table methods, keeping for compatibility if needed briefly
  async getMappingsForPage(pageId) {
    return this.getGroupsByPageId(pageId);
  }

  async addMapping(pageId, fieldGroupId, orderIndex = 0) {
    return await db.insert('acf_page_mapping', {
      page_id: pageId,
      field_group_id: fieldGroupId,
      order_index: orderIndex
    });
  }

  async removeMapping(pageId, fieldGroupId) {
    return await db.delete('acf_page_mapping', `page_id = ? AND field_group_id = ?`, [pageId, fieldGroupId]);
  }

  async clearMappings(pageId) {
    return await db.delete('acf_page_mapping', `page_id = ?`, [pageId]);
  }

  /**
   * User-field assignment index (see migration 034). `assignments` is
   * [{ field_key, user_id }] - the full current set for this entity, not a
   * delta, since a "user" field can be cleared or reassigned freely.
   */
  async replaceUserAssignments(entityType, entityId, assignments) {
    await db.pool.query(
      'DELETE FROM acf_user_assignments WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId]
    );

    if (assignments.length === 0) return;

    const placeholders = assignments.map(() => '(?, ?, ?, ?)').join(', ');
    const values = assignments.flatMap((a) => [entityType, entityId, a.field_key, a.user_id]);
    await db.pool.query(
      `INSERT INTO acf_user_assignments (entity_type, entity_id, field_key, user_id) VALUES ${placeholders}`,
      values
    );
  }

  async getAssignedEntityIds(entityType, userId) {
    const rows = await db.query_All(
      'SELECT DISTINCT entity_id FROM acf_user_assignments WHERE entity_type = ? AND user_id = ?',
      [entityType, userId]
    );
    return rows.map((r) => r.entity_id);
  }
}

module.exports = new AcfRepository();
