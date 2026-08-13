-- Migration 028: Customer Profiles and Addresses
-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100) AFTER name,
ADD COLUMN last_name VARCHAR(100) AFTER first_name,
ADD COLUMN phone VARCHAR(20) AFTER email;

-- Create User Addresses Table
CREATE TABLE IF NOT EXISTS user_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('shipping', 'billing', 'both') DEFAULT 'shipping',
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
