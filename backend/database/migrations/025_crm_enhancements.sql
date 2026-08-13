-- CRM Enhancement Migration
ALTER TABLE form_submissions 
ADD COLUMN assigned_to INT DEFAULT NULL,
ADD COLUMN sales_status ENUM('new', 'attempted_contact', 'meeting_scheduled', 'qualified', 'won', 'lost') DEFAULT 'new',
ADD COLUMN internal_notes LONGTEXT DEFAULT NULL,
ADD CONSTRAINT fk_submissions_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;
