-- Add Sitemap management columns to seo_meta
ALTER TABLE seo_meta ADD COLUMN sitemap_include BOOLEAN DEFAULT TRUE AFTER seo_score;
ALTER TABLE seo_meta ADD COLUMN sitemap_priority DECIMAL(2,1) DEFAULT 0.5 AFTER sitemap_include;
ALTER TABLE seo_meta ADD COLUMN sitemap_changefreq VARCHAR(20) DEFAULT 'monthly' AFTER sitemap_priority;

-- Add index for sitemap queries
CREATE INDEX idx_sitemap_include ON seo_meta(sitemap_include);
