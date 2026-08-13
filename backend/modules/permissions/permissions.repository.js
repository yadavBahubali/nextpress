const db = require('../../config/db');

class PermissionsRepository {
  async getForUser(userId) {
    const rows = await db.query_All(
      'SELECT menu_key FROM user_permissions WHERE user_id = ?',
      [userId]
    );
    return rows.map((r) => r.menu_key);
  }

  async hasPermission(userId, menuKey) {
    const rows = await db.query_All(
      'SELECT id FROM user_permissions WHERE user_id = ? AND menu_key = ? LIMIT 1',
      [userId, menuKey]
    );
    return rows.length > 0;
  }

  // Replaces the full set of grants for a user in one go - the checklist UI
  // always submits the complete desired state, not incremental add/remove.
  async setForUser(userId, menuKeys) {
    await db.pool.query('DELETE FROM user_permissions WHERE user_id = ?', [userId]);

    const uniqueKeys = [...new Set(menuKeys)].filter(Boolean);
    if (uniqueKeys.length === 0) return;

    const placeholders = uniqueKeys.map(() => '(?, ?)').join(', ');
    const values = uniqueKeys.flatMap((key) => [userId, key]);
    await db.pool.query(
      `INSERT INTO user_permissions (user_id, menu_key) VALUES ${placeholders}`,
      values
    );
  }
}

module.exports = new PermissionsRepository();
