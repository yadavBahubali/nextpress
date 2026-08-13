const db = require('../../config/db');

class UsersRepository {
  async getAll() {
    return await db.selectAll('users', 'id, name, email, role_id, created_at');
  }

  async findById(id) {
    return await db.select('users', 'id, name, email, role_id, created_at', `id = ?`, [id]);
  }

  async create(data) {
    return await db.insert('users', data);
  }

  async update(id, data) {
    return await db.update('users', data, `id = ?`, [id]);
  }

  async delete(id) {
    return await db.delete('users', `id = ?`, [id]);
  }
}

module.exports = new UsersRepository();
