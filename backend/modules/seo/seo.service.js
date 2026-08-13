const seoRepository = require('./seo.repository');
const ApiError = require('../../utils/ApiError');

/**
 * SEO Service - Business logic for SEO management
 */
class SeoService {
  /**
   * Get SEO data for an entity
   */
  async getSeoData(entityType, entityId) {
    const seoData = await seoRepository.findByEntity(entityType, entityId);
    
    if (seoData) {
      // Parse JSON fields
      if (typeof seoData.secondary_keywords === 'string') {
        seoData.secondary_keywords = JSON.parse(seoData.secondary_keywords);
      }
      if (typeof seoData.schema_json === 'string') {
        seoData.schema_json = JSON.parse(seoData.schema_json);
      }
    }
    
    return seoData;
  }

  /**
   * Get global SEO data
   */
  async getGlobalSeo() {
    return await this.getSeoData('global', 0);
  }

  /**
   * Upsert SEO data
   */
  async upsertSeoData(data) {
    if (!data.entity_type) {
      throw new ApiError(400, 'Entity type is required');
    }

    // Special handling for global to ensure it hits the UNIQUE constraint
    if (data.entity_type === 'global') {
      data.entity_id = 0;
    }

    // Ensure secondary_keywords and schema_json are strings if passed as objects
    // The repository handles stringification, but we can do some validation here
    
    return await seoRepository.upsert(data);
  }

  /**
   * Delete SEO data
   */
  async deleteSeoData(entityType, entityId) {
    return await seoRepository.delete(entityType, entityId);
  }

  /**
   * Delete SEO data by ID
   */
  async deleteSeoById(id) {
    return await seoRepository.deleteById(id);
  }

  /**
   * Get all redirects for sitemap/middleware
   */
  async getAllRedirects() {
    return await seoRepository.getRedirects();
  }

  /**
   * Get all sitemap entries (pages, posts, custom urls)
   */
  async getSitemapEntries() {
    const db = require('../../config/db');
    
    // Fetch pages with SEO meta
    const [pages] = await db.pool.query(`
      SELECT 
        p.id as entity_id, 'page' as entity_type, p.title, p.slug, p.updated_at,
        s.sitemap_include, s.sitemap_priority, s.sitemap_changefreq, s.is_noindex
      FROM pages p
      LEFT JOIN seo_meta s ON s.entity_type = 'page' AND s.entity_id = p.id
      WHERE p.status = 'published'
    `);

    // Fetch posts with SEO meta
    const [posts] = await db.pool.query(`
      SELECT 
        p.id as entity_id, 'blog' as entity_type, p.title, p.slug, p.updated_at,
        s.sitemap_include, s.sitemap_priority, s.sitemap_changefreq, s.is_noindex
      FROM posts p
      LEFT JOIN seo_meta s ON s.entity_type = 'blog' AND s.entity_id = p.id
      WHERE p.status = 'published'
    `);

    // Fetch custom URLs
    const [customUrls] = await db.pool.query(`
      SELECT
        id as entity_id, entity_type, source_path as slug, updated_at,
        sitemap_include, sitemap_priority, sitemap_changefreq
      FROM seo_meta
      WHERE entity_type = 'custom_url'
    `);

    // Fetch entries for every active, public post type (Industries, and
    // whatever CPTs get registered after it) in one query. entity_type in
    // seo_meta is the post type's own slug (e.g. 'industries'), matching
    // how the generic `/seo/:entityType/:entityId` API already addresses
    // CPT entries - no per-CPT code needed here as new types are added.
    const [cptEntries] = await db.pool.query(`
      SELECT
        e.id as entity_id, pt.slug as entity_type, pt.slug as post_type_slug,
        e.title, e.slug, e.updated_at,
        s.sitemap_include, s.sitemap_priority, s.sitemap_changefreq, s.is_noindex
      FROM cpt_entries e
      JOIN post_types pt ON e.post_type_id = pt.id
      LEFT JOIN seo_meta s ON s.entity_type = pt.slug AND s.entity_id = e.id
      WHERE e.status = 'published' AND pt.is_public = 1 AND pt.is_active = 1
    `);

    return {
      pages,
      posts,
      cptEntries,
      customUrls
    };
  }

  /**
   * Get Site-wide SEO Health Stats
   */
  async getSiteHealth() {
    const db = require('../../config/db');
    const settingsService = require('../settings/settings.service');

    // 1. Check Global Completeness
    const globalSeo = await this.getGlobalSeo();
    let score = 0;
    const checks = [];

    // Global Defaults (20 pts)
    if (globalSeo?.meta_title) { score += 10; checks.push({ id: 'global_title', label: 'Global Title Template', status: 'pass' }); }
    else checks.push({ id: 'global_title', label: 'Global Title Template', status: 'fail', msg: 'Missing global title template' });
    
    if (globalSeo?.meta_description) { score += 10; checks.push({ id: 'global_desc', label: 'Global Fallback Description', status: 'pass' }); }
    else checks.push({ id: 'global_desc', label: 'Global Fallback Description', status: 'fail', msg: 'Missing global description' });

    // Technical (30 pts)
    const domain = await settingsService.getSetting('site_domain');
    if (domain) { score += 15; checks.push({ id: 'domain', label: 'Site Domain Configured', status: 'pass' }); }
    else checks.push({ id: 'domain', label: 'Site Domain Configured', status: 'fail', msg: 'Site domain not set' });

    // Content Audit (50 pts)
    const [missingMeta] = await db.pool.query(`
      SELECT COUNT(*) as count FROM pages 
      LEFT JOIN seo_meta s ON s.entity_type = 'page' AND s.entity_id = pages.id
      WHERE pages.status = 'published' AND (s.meta_description IS NULL OR s.meta_description = '')
    `);
    
    const missingCount = missingMeta[0].count;
    if (missingCount === 0) { score += 50; checks.push({ id: 'content', label: 'Page Meta Descriptions', status: 'pass' }); }
    else {
      const penalty = Math.max(0, 50 - (missingCount * 5));
      score += penalty;
      checks.push({ id: 'content', label: 'Page Meta Descriptions', status: 'warning', msg: `${missingCount} pages missing descriptions` });
    }

    return {
      score: Math.min(100, score),
      checks
    };
  }

  /**
   * Generate XML Sitemap
   */
  async generateSitemap() {
    const db = require('../../config/db');
    
    // 1. Fetch all indexable content
    const [pages] = await db.pool.query(`
      SELECT p.slug, p.updated_at, s.is_noindex, s.sitemap_include, s.sitemap_priority, s.sitemap_changefreq
      FROM pages p 
      LEFT JOIN seo_meta s ON s.entity_type = 'page' AND s.entity_id = p.id
      WHERE p.status = 'published' 
      AND (s.is_noindex IS NULL OR s.is_noindex = 0)
      AND (s.sitemap_include IS NULL OR s.sitemap_include = 1)
    `);

    const [posts] = await db.pool.query(`
      SELECT p.slug, p.updated_at, s.is_noindex, s.sitemap_include, s.sitemap_priority, s.sitemap_changefreq
      FROM posts p 
      LEFT JOIN seo_meta s ON s.entity_type = 'blog' AND s.entity_id = p.id
      WHERE p.status = 'published' 
      AND (s.is_noindex IS NULL OR s.is_noindex = 0)
      AND (s.sitemap_include IS NULL OR s.sitemap_include = 1)
    `);

    const [customUrls] = await db.pool.query(`
      SELECT source_path as slug, updated_at, sitemap_priority, sitemap_changefreq
      FROM seo_meta
      WHERE entity_type = 'custom_url' AND sitemap_include = 1
    `);

    // Published entries for every active, public post type - see the same
    // query/comment in getSitemapEntries() above.
    const [cptEntries] = await db.pool.query(`
      SELECT pt.slug as post_type_slug, e.slug as entry_slug, e.updated_at,
             s.is_noindex, s.sitemap_include, s.sitemap_priority, s.sitemap_changefreq
      FROM cpt_entries e
      JOIN post_types pt ON e.post_type_id = pt.id
      LEFT JOIN seo_meta s ON s.entity_type = pt.slug AND s.entity_id = e.id
      WHERE e.status = 'published' AND pt.is_public = 1 AND pt.is_active = 1
      AND (s.is_noindex IS NULL OR s.is_noindex = 0)
      AND (s.sitemap_include IS NULL OR s.sitemap_include = 1)
    `);

    // 2. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const addUrl = (slug, date, priority = 0.5, freq = 'monthly') => {
      const lastMod = new Date(date).toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>%DOMAIN%/${slug}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>${freq || 'monthly'}</changefreq>\n`;
      xml += `    <priority>${priority || 0.5}</priority>\n`;
      xml += `  </url>\n`;
    };

    pages.forEach(p => addUrl(
      p.slug === 'home' ? '' : p.slug, 
      p.updated_at, 
      p.sitemap_priority, 
      p.sitemap_changefreq
    ));
    
    posts.forEach(p => addUrl(
      `blog/${p.slug}`, 
      p.updated_at, 
      p.sitemap_priority, 
      p.sitemap_changefreq
    ));

    customUrls.forEach(u => addUrl(
      u.slug,
      u.updated_at,
      u.sitemap_priority,
      u.sitemap_changefreq
    ));

    cptEntries.forEach(e => addUrl(
      `${e.post_type_slug}/${e.entry_slug}`,
      e.updated_at,
      e.sitemap_priority,
      e.sitemap_changefreq
    ));

    xml += `</urlset>`;

    return xml;
  }

  /**
   * Generate robots.txt content
   */
  async generateRobotsTxt() {
    const settingsService = require('../settings/settings.service');
    
    // Check for custom content first
    const custom = await settingsService.getSetting('robots_txt_custom');
    if (custom) return custom;

    const domainRes = await settingsService.getSetting('site_domain');
    const domain = (domainRes || 'https://nextpress.com').replace(/\/$/, '');
    
    // Get global SEO for index/noindex defaults
    const globalSeo = await this.getGlobalSeo();
    const isGlobalNoindex = globalSeo ? globalSeo.is_noindex : false;

    let content = "User-agent: *\n";
    
    if (isGlobalNoindex) {
      content += "Disallow: /\n";
    } else {
      content += "Allow: /\n";
      content += "Disallow: /admin/\n";
      content += "Disallow: /api/\n";
      content += "Disallow: /login\n";
    }

    content += `\nSitemap: ${domain}/sitemap.xml\n`;
    
    return content;
  }

  /**
   * Save sitemap and robots.txt to physical files in frontend public
   */
  async updatePublicSeoFiles() {
    const fs = require('fs').promises;
    const path = require('path');
    const settingsService = require('../settings/settings.service');

    // 1. Generate Contents
    const xml = await this.generateSitemap();
    const robots = await this.generateRobotsTxt();
    
    // 2. Get domain to replace placeholder in sitemap
    const domainRes = await settingsService.getSetting('site_domain');
    const domain = (domainRes || 'https://nextpress.com').replace(/\/$/, '');
    const finalXml = xml.replace(/%DOMAIN%/g, domain);

    // 3. Determine save paths
    const frontendPublic = path.join(__dirname, '../../../frontend/public');
    const files = [
      { name: 'sitemap.xml', content: finalXml },
      { name: 'robots.txt', content: robots }
    ];

    let results = [];
    
    for (const file of files) {
      const targetPath = path.join(frontendPublic, file.name);
      try {
        await fs.mkdir(frontendPublic, { recursive: true });
        await fs.writeFile(targetPath, file.content);
        results.push({ file: file.name, path: targetPath, success: true });
        console.log(`SEO File saved: ${targetPath}`);
      } catch (err) {
        console.warn(`Could not save ${file.name} to ${targetPath}: ${err.message}`);
        
        // Fallback to backend uploads if frontend public is unreachable
        const fallbackPath = path.join(__dirname, '../../uploads', file.name);
        try {
          await fs.writeFile(fallbackPath, file.content);
          results.push({ file: file.name, path: fallbackPath, success: true, is_fallback: true });
        } catch (e) {
          results.push({ file: file.name, error: e.message, success: false });
        }
      }
    }

    return results;
  }
}

module.exports = new SeoService();
