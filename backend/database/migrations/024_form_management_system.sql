-- Forms Configuration Table
CREATE TABLE IF NOT EXISTS forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  fields LONGTEXT NOT NULL, -- Configuration for all inputs
  settings LONGTEXT NULL,   -- Success msg, notify email, redirects
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Form Submissions Table
CREATE TABLE IF NOT EXISTS form_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  data LONGTEXT NOT NULL, -- Submitted key-value pairs
  status ENUM('unread', 'read', 'archived', 'spam') DEFAULT 'unread',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Seed an initial Contact Form
INSERT IGNORE INTO forms (title, slug, description, fields, settings) VALUES (
  'Contact Us',
  'contact-us',
  'Standard contact form for the main website.',
  '[{"id":"f1","type":"text","name":"name","label":"Full Name","placeholder":"Enter your name","required":true,"width":"col-md-6"},{"id":"f2","type":"email","name":"email","label":"Email Address","placeholder":"Enter your email","required":true,"width":"col-md-6"},{"id":"f3","type":"text","name":"subject","label":"Subject","placeholder":"How can we help?","required":false,"width":"col-12"},{"id":"f4","type":"textarea","name":"message","label":"Message","placeholder":"Type your message here...","required":true,"width":"col-12"}]',
  '{"success_message":"Thank you! Your message has been sent successfully.","admin_email":"admin@nextpress.com","submit_button_text":"Send Message"}'
);
