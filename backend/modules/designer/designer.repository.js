const db = require('../../config/db');

class DesignerRepository {
  async getTemplates() {
    return await db.selectAll('room_templates', '*', '', 'ORDER BY id ASC');
  }

  async getRecommendations(roomTypeId, length, seats) {
    // Rule-based engine
    const query = `
      SELECT p.* 
      FROM designer_products p
      JOIN solution_rules r ON p.id = r.recommended_product_id
      WHERE r.room_type_id = ? 
      AND (r.min_length IS NULL OR ? >= r.min_length)
      AND (r.max_length IS NULL OR ? <= r.max_length)
      AND (r.min_seats IS NULL OR ? >= r.min_seats)
      AND (r.max_seats IS NULL OR ? <= r.max_seats)
      AND r.is_active = 1
    `;
    
    return await db.query_All(query, [roomTypeId, length, length, seats, seats]);
  }

  async createConfiguration(data) {
    return await db.insert('room_configurations', {
      user_id: data.user_id || null,
      config_name: data.config_name,
      region: data.region,
      industry: data.industry,
      room_type_id: data.room_type_id,
      width: data.width,
      length: data.length,
      height: data.height,
      seats: data.seats,
      table_type: data.table_type,
      unit_system: data.unit_system,
      selected_products: JSON.stringify(data.selected_products),
      preview_image_path: data.preview_image_path || null
    });
  }

  async createQuotation(data) {
    return await db.insert('designer_quotations', {
      config_id: data.config_id,
      user_id: data.user_id || null,
      quote_number: `DV-QT-${Date.now()}`,
      total_price: data.total_price,
      status: 'draft',
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
  }

  async getConfigurationById(id) {
    return await db.select('room_configurations', '*', `id = ?`, [id]);
  }
}

module.exports = new DesignerRepository();
