const db = require('../../config/db');

class SettingsRepository {
  async getByKey(key) {
    const results = await db.selectAll('settings', '*', `setting_key = ?`, '', [key]);
    return results[0];
  }

  async setByKey(key, value, group = 'general') {
    const existing = await this.getByKey(key);
    if (existing) {
      return await db.update(
        'settings',
        { setting_value: value, setting_group: group },
        `setting_key = ?`,
        [key]
      );
    } else {
      return await db.insert('settings', {
        setting_key: key,
        setting_value: value,
        setting_group: group
      });
    }
  }

  async getAllByGroup(group) {
    return await db.selectAll('settings', '*', `setting_group = ?`, '', [group]);
  }

  async deleteByKey(key) {
    return await db.delete('settings', `setting_key = ?`, [key]);
  }

  async getSystemModules() {
    return await db.queryAll('SELECT * FROM system_modules');
  }

  async updateSystemModule(module_key, is_enabled) {
    return await db.update(
      'system_modules',
      { is_enabled: is_enabled ? 1 : 0 },
      `module_key = ?`,
      [module_key]
    );
  }
}

module.exports = new SettingsRepository();
