-- Add seo_title column to pages table
ALTER TABLE pages 
ADD COLUMN seo_title VARCHAR(255) NULL AFTER internal_name;

-- Copy existing titles to seo_title as a starting point
UPDATE pages SET seo_title = title;
