-- Add description (excerpt) column to pages table
ALTER TABLE pages 
ADD COLUMN description TEXT NULL AFTER slug;
