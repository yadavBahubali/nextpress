-- Careers and HR Module Schema

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(100) DEFAULT NULL,
  location VARCHAR(100) DEFAULT NULL,
  type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
  description TEXT NOT NULL,
  requirements TEXT DEFAULT NULL,
  status ENUM('published', 'closed', 'draft') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  linkedin_url VARCHAR(255) DEFAULT NULL,
  resume_path VARCHAR(255) NOT NULL,
  status ENUM('new', 'reviewed', 'interviewing', 'offered', 'hired', 'rejected') DEFAULT 'new',
  internal_notes LONGTEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
