-- Add editorial metrics to posts table
ALTER TABLE posts ADD COLUMN reading_time INT DEFAULT 0;
ALTER TABLE posts ADD COLUMN show_toc TINYINT(1) DEFAULT 0;
