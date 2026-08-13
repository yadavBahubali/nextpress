const db = require('../../config/db');

class AuthRepository {
  async findByEmail(email) {
    const rows = await db.query_All('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  async findById(id) {
    const rows = await db.query_All(
      'SELECT id, name, email, role_id FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  async createUser(userData) {
    return await db.insert('users', {
      name: userData.name,
      email: userData.email,
      password_hash: userData.password,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      phone: userData.phone || null,
      role_id: userData.role_id || 4 // Default to viewer/customer role for registration
    });
  }

  async updateRefreshToken(userId, refreshToken) {
    return await db.update('users', { refresh_token: refreshToken }, `id = ?`, [userId]);
  }

  async findByRefreshToken(refreshToken) {
    const rows = await db.query_All('SELECT * FROM users WHERE refresh_token = ?', [refreshToken]);
    return rows[0];
  }

  async getAllUsers() {
    return await db.selectAll('users', 'id, name, email, role_id', '', 'ORDER BY name ASC');
  }
}

module.exports = new AuthRepository();
