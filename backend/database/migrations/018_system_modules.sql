CREATE TABLE IF NOT EXISTS system_modules (
  module_key VARCHAR(50) PRIMARY KEY,
  is_enabled BOOLEAN DEFAULT TRUE,
  display_name VARCHAR(100),
  description TEXT
);

INSERT IGNORE INTO system_modules (module_key, is_enabled, display_name, description) VALUES
('ecommerce', 1, 'Ecommerce Management', 'Manage products, orders, and customers.'),
('sales_leads', 1, 'Sales & Leads', 'Manage lead inbox and sales dashboards.'),
('hr_careers', 1, 'HR & Careers', 'Manage job boards and applicants ATS.');
