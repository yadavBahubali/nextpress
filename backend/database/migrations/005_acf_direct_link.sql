-- Add page_id and order_index directly to acf_field_groups
ALTER TABLE acf_field_groups 
ADD COLUMN page_id INT NULL AFTER active,
ADD COLUMN order_index INT DEFAULT 0 AFTER page_id,
ADD CONSTRAINT fk_acf_page_id FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE SET NULL;
