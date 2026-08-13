-- Professional SEO Management System
-- Enhancing the seo_meta table to support polymorphic entities and advanced SEO fields

DROP TABLE IF EXISTS seo_meta;

CREATE TABLE seo_meta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- 'page', 'post', 'product', 'category', 'global'
  entity_id INT DEFAULT NULL,      -- ID of the related entity (NULL for global)
  
  -- General SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  focus_keyword VARCHAR(255),
  secondary_keywords LONGTEXT,          -- Array of strings
  
  -- Open Graph (Social)
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(255),            -- URL or Media ID
  
  -- Twitter Card
  twitter_title VARCHAR(255),
  twitter_description TEXT,
  twitter_image VARCHAR(255),
  
  -- Schema / Structured Data
  schema_type VARCHAR(50),          -- 'Article', 'Product', 'FAQPage', etc.
  schema_json LONGTEXT,                 -- Custom LONGTEXT-LD overrides
  
  -- Advanced
  is_noindex BOOLEAN DEFAULT FALSE,
  is_nofollow BOOLEAN DEFAULT FALSE,
  canonical_url VARCHAR(255),
  
  -- Redirects
  redirect_url VARCHAR(255),        
  redirect_type INT DEFAULT 301,    -- 301, 302, 307
  
  -- Analysis Results
  seo_score INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Constraints & Indexes
  UNIQUE KEY unique_entity (entity_type, entity_id),
  INDEX idx_seo_score (seo_score),
  INDEX idx_redirects (redirect_url)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
