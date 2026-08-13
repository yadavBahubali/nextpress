const db = require('../../config/db');

/**
 * SEO Repository - Polymorphic SEO meta data handler
 */
class SeoRepository {
  /**
   * Find SEO meta by entity type and ID
   */
  async findByEntity(entityType, entityId) {
    const [rows] = await db.pool.query(
      'SELECT * FROM seo_meta WHERE entity_type = ? AND entity_id <=> ?',
      [entityType, entityId]
    );
    return rows[0] || null;
  }

  /**
   * Find global SEO meta
   */
  async findGlobal() {
    const [rows] = await db.pool.query(
      'SELECT * FROM seo_meta WHERE entity_type = "global" AND entity_id IS NULL'
    );
    return rows[0] || null;
  }

  /**
   * Create or Update SEO meta
   */
  async upsert(data) {
    const {
      entity_type,
      entity_id,
      source_path,
      meta_title,
      meta_description,
      focus_keyword,
      secondary_keywords,
      og_title,
      og_description,
      og_image,
      twitter_title,
      twitter_description,
      twitter_image,
      schema_type,
      schema_json,
      is_noindex,
      is_nofollow,
      canonical_url,
      redirect_url,
      redirect_type,
      seo_score,
      sitemap_include,
      sitemap_priority,
      sitemap_changefreq,
      title_separator
    } = data;

    const query = `
      INSERT INTO seo_meta (
        entity_type, entity_id, source_path, meta_title, meta_description, focus_keyword, 
        secondary_keywords, og_title, og_description, og_image, 
        twitter_title, twitter_description, twitter_image, 
        schema_type, schema_json, is_noindex, is_nofollow, 
        canonical_url, redirect_url, redirect_type, seo_score,
        sitemap_include, sitemap_priority, sitemap_changefreq,
        title_separator
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        source_path = VALUES(source_path),
        meta_title = VALUES(meta_title),
        meta_description = VALUES(meta_description),
        focus_keyword = VALUES(focus_keyword),
        secondary_keywords = VALUES(secondary_keywords),
        og_title = VALUES(og_title),
        og_description = VALUES(og_description),
        og_image = VALUES(og_image),
        twitter_title = VALUES(twitter_title),
        twitter_description = VALUES(twitter_description),
        twitter_image = VALUES(twitter_image),
        schema_type = VALUES(schema_type),
        schema_json = VALUES(schema_json),
        is_noindex = VALUES(is_noindex),
        is_nofollow = VALUES(is_nofollow),
        canonical_url = VALUES(canonical_url),
        redirect_url = VALUES(redirect_url),
        redirect_type = VALUES(redirect_type),
        seo_score = VALUES(seo_score),
        sitemap_include = VALUES(sitemap_include),
        sitemap_priority = VALUES(sitemap_priority),
        sitemap_changefreq = VALUES(sitemap_changefreq),
        title_separator = VALUES(title_separator)
    `;

    const values = [
      entity_type, entity_id, source_path || null, meta_title, meta_description, focus_keyword,
      secondary_keywords ? JSON.stringify(secondary_keywords) : null,
      og_title, og_description, og_image,
      twitter_title, twitter_description, twitter_image,
      schema_type, schema_json ? JSON.stringify(schema_json) : null,
      is_noindex ? 1 : 0,
      is_nofollow ? 1 : 0,
      canonical_url, redirect_url, redirect_type, seo_score,
      sitemap_include === undefined ? 1 : (sitemap_include ? 1 : 0),
      sitemap_priority || 0.5,
      sitemap_changefreq || 'monthly',
      title_separator || '-'
    ];

    const [result] = await db.pool.query(query, values);
    return result.insertId;
  }

  /**
   * Delete SEO meta
   */
  async delete(entityType, entityId) {
    const [result] = await db.pool.query(
      'DELETE FROM seo_meta WHERE entity_type = ? AND entity_id <=> ?',
      [entityType, entityId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete SEO meta by ID
   */
  async deleteById(id) {
    const [result] = await db.pool.query(
      'DELETE FROM seo_meta WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get all redirects
   */
  async getRedirects() {
    const [rows] = await db.pool.query(
      'SELECT id, entity_type, entity_id, source_path, redirect_url, redirect_type FROM seo_meta WHERE redirect_url IS NOT NULL'
    );
    return rows;
  }

}

module.exports = new SeoRepository();
