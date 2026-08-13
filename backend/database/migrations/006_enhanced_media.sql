-- Enhance Media Table for Professional Asset Management
ALTER TABLE media 
ADD COLUMN caption TEXT AFTER alt_text,
ADD COLUMN description TEXT AFTER caption,
ADD COLUMN dimensions VARCHAR(50) AFTER description,
ADD COLUMN thumbnail_url VARCHAR(255) AFTER dimensions;
