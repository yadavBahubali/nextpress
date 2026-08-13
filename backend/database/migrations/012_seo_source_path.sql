-- Add source_path to seo_meta to support standalone redirects
ALTER TABLE seo_meta ADD COLUMN source_path VARCHAR(255) AFTER entity_id;
CREATE INDEX idx_source_path ON seo_meta(source_path);
