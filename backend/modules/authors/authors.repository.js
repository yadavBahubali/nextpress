const db = require('../../config/db');

class AuthorsRepository {
  async getAll() {
    const query = `
      SELECT a.*, m.path as profile_image_path
      FROM authors a
      LEFT JOIN media m ON a.profile_image_id = m.id
      ORDER BY a.name ASC
    `;
    return await db.queryAll(query);
  }

  async findById(id) {
    const query = `
      SELECT a.*, m.path as profile_image_path
      FROM authors a
      LEFT JOIN media m ON a.profile_image_id = m.id
      WHERE a.id = ?
    `;
    const results = await db.query_All(query, [id]);
    return results[0];
  }

  async findBySlug(slug) {
    const query = `
      SELECT a.*, m.path as profile_image_path
      FROM authors a
      LEFT JOIN media m ON a.profile_image_id = m.id
      WHERE a.slug = ?
    `;
    const results = await db.query_All(query, [slug]);
    return results[0];
  }

  async create(data) {
    const { social_links, profile_image_path, ...rest } = data;
    const insertData = {
      ...rest,
      social_links: social_links ? (typeof social_links === 'object' ? JSON.stringify(social_links) : social_links) : null
    };
    const result = await db.insert('authors', insertData);
    return result.insert_id;
  }

  async update(id, data) {
    const { social_links, profile_image_path, ...rest } = data;
    const updateData = { ...rest };
    if (social_links) {
      updateData.social_links = typeof social_links === 'object' ? JSON.stringify(social_links) : social_links;
    }
    return await db.update('authors', updateData, `id = ?`, [id]);
  }

  async delete(id) {
    return await db.delete('authors', `id = ?`, [id]);
  }
}

module.exports = new AuthorsRepository();
