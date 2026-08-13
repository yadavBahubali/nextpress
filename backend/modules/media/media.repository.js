const db = require('../../config/db');

class MediaRepository {
  async getAllMedia() {
    return await db.selectAll('media', '*', '', 'ORDER BY created_at DESC');
  }

  async findById(id) {
    return await db.select('media', '*', `id = ?`, [id]);
  }

  async create(data) {
    const result = await db.insert('media', {
      filename: data.filename,
      original_name: data.original_name,
      mime_type: data.mime_type,
      size: data.size,
      path: data.path,
      alt_text: data.alt_text || '',
      caption: data.caption || '',
      description: data.description || '',
      dimensions: data.dimensions || null,
      thumbnail_url: data.thumbnail_url || null
    });
    return result.insert_id;
  }

  async delete(id) {
    return await db.delete('media', `id = ?`, [id]);
  }

  async update(id, data) {
    return await db.update('media', data, `id = ?`, [id]);
  }
}

module.exports = new MediaRepository();
