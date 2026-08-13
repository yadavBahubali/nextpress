-- Mapping table for Pages and ACF Field Groups
CREATE TABLE IF NOT EXISTS acf_page_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    field_group_id BIGINT NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (field_group_id) REFERENCES acf_field_groups(id) ON DELETE CASCADE,
    UNIQUE KEY (page_id, field_group_id)
);
