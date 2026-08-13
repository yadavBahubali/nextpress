-- Migration 030: 3D Room Configurator and Solution Designer

-- 1. Room Templates
CREATE TABLE IF NOT EXISTS room_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_path VARCHAR(255),
  default_width FLOAT DEFAULT 4.0,
  default_length FLOAT DEFAULT 5.0,
  default_height FLOAT DEFAULT 2.8,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Solution Designer Products (Separate from ecommerce if needed for technical specs)
CREATE TABLE IF NOT EXISTS designer_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('display', 'camera', 'speaker', 'microphone', 'ops', 'accessory') NOT NULL,
  model_name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  specs LONGTEXT, -- Technical specs like FOV, Resolution, Pickup Range
  base_price DECIMAL(10, 2) DEFAULT 0.00,
  image_url VARCHAR(255),
  three_d_model_path VARCHAR(255), -- Path to GLB file
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Recommendation Rules
CREATE TABLE IF NOT EXISTS solution_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id INT,
  min_length FLOAT,
  max_length FLOAT,
  min_seats INT,
  max_seats INT,
  recommended_product_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (room_type_id) REFERENCES room_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (recommended_product_id) REFERENCES designer_products(id) ON DELETE CASCADE
);

-- 4. Room Configurations
CREATE TABLE IF NOT EXISTS room_configurations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  config_name VARCHAR(255),
  region VARCHAR(100),
  industry VARCHAR(100),
  room_type_id INT,
  width FLOAT,
  length FLOAT,
  height FLOAT,
  seats INT,
  table_type VARCHAR(50),
  unit_system ENUM('metric', 'imperial') DEFAULT 'metric',
  selected_products LONGTEXT, -- Array of product IDs
  preview_image_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (room_type_id) REFERENCES room_templates(id) ON DELETE SET NULL
);

-- 5. Quotations
CREATE TABLE IF NOT EXISTS designer_quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_id INT NOT NULL,
  user_id INT,
  quote_number VARCHAR(50) NOT NULL UNIQUE,
  total_price DECIMAL(10, 2),
  status ENUM('draft', 'sent', 'accepted', 'expired') DEFAULT 'draft',
  expiry_date DATE,
  pdf_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (config_id) REFERENCES room_configurations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Initial Seeding for Room Templates
INSERT IGNORE INTO room_templates (name, slug, description, default_width, default_length) VALUES 
('Huddle Room', 'huddle-room', 'Small collaborative space for 2-4 people', 3.0, 3.5),
('Meeting Room', 'meeting-room', 'Standard meeting space for 6-10 people', 4.5, 6.0),
('Board Room', 'board-room', 'Executive space for 12+ people', 6.0, 10.0),
('Training Room', 'training-room', 'Flexible space for education and workshops', 8.0, 12.0),
('Auditorium', 'auditorium', 'Large scale presentation space', 15.0, 25.0);
