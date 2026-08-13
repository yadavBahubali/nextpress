-- Add title_separator column to seo_meta for global title templates
ALTER TABLE seo_meta ADD COLUMN title_separator VARCHAR(10) DEFAULT '-' AFTER meta_title;
