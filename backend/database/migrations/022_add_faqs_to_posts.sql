-- Add faqs column to posts table
ALTER TABLE posts ADD COLUMN faqs LONGTEXT DEFAULT NULL AFTER content;
