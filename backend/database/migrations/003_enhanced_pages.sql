-- Add template and LONGTEXT columns to pages table
ALTER TABLE pages 
ADD COLUMN template VARCHAR(255) DEFAULT 'default' AFTER status,
ADD COLUMN content_json LONGTEXT NULL AFTER template,
ADD COLUMN seo_meta LONGTEXT NULL AFTER content_json;
