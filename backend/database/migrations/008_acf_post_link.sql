-- Add post_id to acf_field_groups to support assigning groups to specific blog posts
ALTER TABLE acf_field_groups ADD COLUMN IF NOT EXISTS post_id INT DEFAULT NULL;
ALTER TABLE acf_field_groups ADD CONSTRAINT fk_acf_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL;
