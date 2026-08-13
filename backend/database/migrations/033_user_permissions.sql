-- Distinct staff "Viewer" role, separate from role_id 4 (the public/customer
-- default handed out by POST /auth/register). Sharing one role_id between
-- "any random public signup" and "internal staff explicitly granted
-- read-only admin access" would mean a single future bug in permission
-- granting could expose admin data to a public account. Keeping them apart
-- means role_id 4 can never reach the admin panel, full stop, regardless of
-- what user_permissions ever contains.
INSERT INTO roles (id, name, description)
VALUES (5, 'staff_viewer', 'Internal staff - read-only access to specifically granted admin sections')
ON DUPLICATE KEY UPDATE name = name;

UPDATE roles SET description = 'Public self-registered account - no admin panel access' WHERE id = 4;

-- Per-user grants of which admin sections a role_id 3 (Editor) or 5 (Viewer)
-- account can reach. menu_key is the destination path as shown in
-- Sidebar.tsx (e.g. 'forms/submissions'), deliberately keyed to the actual
-- route rather than a sidebar label, since two different sidebar entries
-- (e.g. "Lead Inbox" under Sales & Leads and "Submissions" under Forms) can
-- point at the exact same page - one grant should cover both.
-- Super Admin (1) and Admin (2) are never checked against this table -
-- they always have full access.
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  menu_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_menu (user_id, menu_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
