-- Add internal_name column to pages table
ALTER TABLE pages 
ADD COLUMN internal_name VARCHAR(255) NULL AFTER id;

-- Set initial values for internal_name from title
UPDATE pages SET internal_name = title WHERE internal_name IS NULL;
