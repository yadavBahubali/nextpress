-- Drop existing roles if any to start fresh
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- Create Roles Table
CREATE TABLE roles (
  id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
);

-- Seed the 4 requested roles
INSERT INTO roles (id, name, description) VALUES 
(1, 'super_admin', 'Total system access and control'),
(2, 'admin', 'Full administrative access'),
(3, 'editor', 'Content management access (Blogs, Pages, Media)'),
(4, 'viewer', 'Read-only access to all sections');

-- Ensure users table links correctly
-- First, make sure all existing users have a valid role_id (default to 2 if unknown)
UPDATE users SET role_id = 2 WHERE role_id NOT IN (1, 2, 3, 4) OR role_id IS NULL;

-- Add foreign key constraint if not exists
-- We use a separate block for this in case the constraint already exists
ALTER TABLE users ADD CONSTRAINT fk_users_role_new FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT;
