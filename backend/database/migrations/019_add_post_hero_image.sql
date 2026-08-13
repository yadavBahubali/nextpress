-- Add hero_image_id to posts table
ALTER TABLE posts ADD COLUMN hero_image_id INT DEFAULT NULL AFTER featured_image_id;
ALTER TABLE posts ADD CONSTRAINT fk_posts_hero_image FOREIGN KEY (hero_image_id) REFERENCES media(id) ON DELETE SET NULL;
