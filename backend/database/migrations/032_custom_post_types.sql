-- Custom Post Types (CPT) engine: a generic system for content types beyond
-- the built-in Pages and Blog Posts (e.g. Industries, Events, News).
-- This migration is purely additive: it creates two brand-new tables and
-- does not ALTER, rename, or drop any existing table.

-- Registry of post types. Each row = one CPT (e.g. "industries"). Adding a
-- new CPT is just a new row here - no schema change required per CPT.
CREATE TABLE IF NOT EXISTS post_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  singular_label VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT NULL,
  description TEXT NULL,
  is_public TINYINT(1) DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Generic entries for any registered post type (e.g. one row per Industry).
-- ACF field VALUES for an entry live in its own content_json column, the
-- same pattern already used by the `pages` table. The ACF field SCHEMA
-- (which fields exist) stays in acf_field_groups, matched to a post type via
-- its existing `settings.location_rules` JSON (param: 'post_type', value:
-- <slug>) - no new column on acf_field_groups is needed, so that table (and
-- its existing page_id/post_id direct-link columns) is left untouched.
CREATE TABLE IF NOT EXISTS cpt_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_type_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',
  featured_image_id INT DEFAULT NULL,
  content_json LONGTEXT NULL,
  order_index INT DEFAULT 0,
  author_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_post_type_slug (post_type_id, slug),
  FOREIGN KEY (post_type_id) REFERENCES post_types(id) ON DELETE CASCADE,
  FOREIGN KEY (featured_image_id) REFERENCES media(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed the first real CPT: Industries.
INSERT INTO post_types (slug, label, singular_label, icon, description, is_public, is_active)
SELECT 'industries', 'Industries', 'Industry', 'FaIndustry', 'Sector/industry pages, e.g. IT Services, Healthcare.', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM post_types WHERE slug = 'industries');
