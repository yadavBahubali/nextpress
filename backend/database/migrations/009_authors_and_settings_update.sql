-- Authors Table
CREATE TABLE IF NOT EXISTS authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(100),
  bio TEXT,
  details TEXT,
  profile_image_id INT DEFAULT NULL,
  social_links LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_image_id) REFERENCES media(id) ON DELETE SET NULL
);

-- Add author_profile_id to posts table
ALTER TABLE posts ADD COLUMN author_profile_id INT DEFAULT NULL AFTER author_id;
ALTER TABLE posts ADD CONSTRAINT fk_posts_author_profile FOREIGN KEY (author_profile_id) REFERENCES authors(id) ON DELETE SET NULL;

-- Initial Settings for Media (Resolving uploading issues)
INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES 
('media_max_image_size', '5', 'media'),
('media_max_video_size', '100', 'media'),
('media_allowed_extensions', 'jpg, jpeg, png, gif, webp, svg, mp4, mov, pdf, doc, docx', 'media'),
('media_auto_resize', 'true', 'media');

-- Initial Settings for General
INSERT IGNORE INTO settings (setting_key, setting_value, setting_group) VALUES 
('site_title', 'NextPress Enterprise', 'general'),
('site_tagline', 'Premium Enterprise Solutions', 'general');
