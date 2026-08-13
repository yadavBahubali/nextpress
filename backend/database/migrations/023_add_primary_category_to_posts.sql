-- Add category_id to posts for primary category reference
ALTER TABLE posts ADD COLUMN category_id INT DEFAULT NULL AFTER author_id;
ALTER TABLE posts ADD FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL;
