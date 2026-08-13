-- Companion index for the ACF "user" field type (see FieldType in
-- frontend/src/types/acf.ts). Field values themselves stay in each entity's
-- own content_json blob, same as every other field type - this table exists
-- purely so "show me only entries assigned to user X" is a fast, indexed
-- lookup instead of scanning JSON on every request. Kept in sync by
-- acf.service.js whenever an entity with a "user" field is saved.
CREATE TABLE IF NOT EXISTS acf_user_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_entity_field (entity_type, entity_id, field_key),
  INDEX idx_lookup (entity_type, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
