const db = require('../../config/db');

class PostsRepository {
  async getAll(params = {}) {
    const { status, search, category_id, tag_id, author_id, limit = 20, offset = 0 } = params;

    let where = '1=1';
    let joins = '';
    const values = [];

    if (status) {
      where += ` AND p.status = ?`;
      values.push(status);
    }

    if (author_id) {
      where += ` AND p.author_id = ?`;
      values.push(author_id);
    }

    if (category_id) {
      joins += ` JOIN post_blog_categories pbc ON p.id = pbc.post_id`;
      where += ` AND pbc.category_id = ?`;
      values.push(category_id);
    }

    if (tag_id) {
      joins += ` JOIN post_tags pt ON p.id = pt.post_id`;
      where += ` AND pt.tag_id = ?`;
      values.push(tag_id);
    }

    if (search) {
      where += ` AND (p.title LIKE ? OR p.content LIKE ?)`;
      values.push(`%${search}%`, `%${search}%`);
    }

    // limit/offset are only ever used as LIMIT/OFFSET literals, which can't
    // take `?` placeholders reliably across mysql2 query modes, so they're
    // coerced to safe integers instead of interpolating the raw input.
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);

    const query = `
      SELECT DISTINCT p.*, u.name as author_name, m.path as featured_image_path
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN media m ON p.featured_image_id = m.id
      ${joins}
      WHERE ${where}
      ORDER BY p.created_at DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `;

    return await db.query_All(query, values);
  }

  async findById(id) {
    const query = `
      SELECT p.*, u.name as author_name, m.path as featured_image_path, hm.path as hero_image_path
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN media m ON p.featured_image_id = m.id
      LEFT JOIN media hm ON p.hero_image_id = hm.id
      WHERE p.id = ?
    `;
    const results = await db.query_All(query, [id]);
    return results[0];
  }

  async findBySlug(slug) {
    const query = `
      SELECT p.*, u.name as author_name, m.path as featured_image_path, hm.path as hero_image_path
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN media m ON p.featured_image_id = m.id
      LEFT JOIN media hm ON p.hero_image_id = hm.id
      WHERE p.slug = ?
    `;
    const results = await db.query_All(query, [slug]);
    return results[0];
  }

  async create(data) {
    const result = await db.insert('posts', data);
    return result.insertId;
  }

  async update(id, data) {
    return await db.update('posts', data, `id = ?`, [id]);
  }

  async delete(id) {
    return await db.delete('posts', `id = ?`, [id]);
  }

  // Categories
  async addCategories(postId, categoryIds) {
    for (const catId of categoryIds) {
      await db.insert('post_blog_categories', { post_id: postId, category_id: catId });
    }
  }

  async clearCategories(postId) {
    await db.query_All(`DELETE FROM post_blog_categories WHERE post_id = ?`, [postId]);
  }

  async getPostCategories(postId) {
    const query = `
      SELECT c.*
      FROM blog_categories c
      JOIN post_blog_categories pbc ON c.id = pbc.category_id
      WHERE pbc.post_id = ?
    `;
    return await db.query_All(query, [postId]);
  }

  async getAllCategories() {
    return await db.selectAll('blog_categories', '*', '', 'ORDER BY name ASC');
  }

  async createCategory(data) {
    const result = await db.insert('blog_categories', data);
    return result.insertId;
  }

  // Tags
  async addTags(postId, tagIds) {
    for (const tagId of tagIds) {
      await db.insert('post_tags', { post_id: postId, tag_id: tagId });
    }
  }

  async clearTags(postId) {
    await db.query_All(`DELETE FROM post_tags WHERE post_id = ?`, [postId]);
  }

  async getPostTags(postId) {
    const query = `
      SELECT t.*
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `;
    return await db.query_All(query, [postId]);
  }

  async getAllTags() {
    return await db.selectAll('tags', '*', '', 'ORDER BY name ASC');
  }

  async findTagBySlug(slug) {
    const results = await db.selectAll('tags', '*', `slug = ?`, '', [slug]);
    return results[0];
  }

  async createTag(data) {
    const result = await db.insert('tags', data);
    return result.insertId;
  }

  async deleteTag(id) {
    return await db.delete('tags', `id = ?`, [id]);
  }
}

module.exports = new PostsRepository();
