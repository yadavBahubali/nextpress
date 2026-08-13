const settingsRepository = require('./settings.repository');

class SettingsService {
  /**
   * Get Author Metadata from settings table
   */
  async getAuthorMeta(authorId) {
    const key = `author_meta_${authorId}`;
    const setting = await settingsRepository.getByKey(key);
    
    if (!setting) return null;
    
    try {
      return JSON.parse(setting.setting_value);
    } catch (e) {
      return setting.setting_value;
    }
  }

  /**
   * Save Author Metadata to settings table
   */
  async saveAuthorMeta(authorId, data) {
    const key = `author_meta_${authorId}`;
    const value = typeof data === 'object' ? JSON.stringify(data) : data;
    return await settingsRepository.setByKey(key, value, 'author_metadata');
  }

  /**
   * Generic setting getter
   */
  async getSetting(key, defaultValue = null) {
    const setting = await settingsRepository.getByKey(key);
    if (!setting) return defaultValue;
    
    try {
      // Try to parse as JSON if it looks like JSON
      if (setting.setting_value && (setting.setting_value.startsWith('{') || setting.setting_value.startsWith('['))) {
        return JSON.parse(setting.setting_value);
      }
      return setting.setting_value;
    } catch (e) {
      return setting.setting_value;
    }
  }

  /**
   * Get multiple settings by group
   */
  async getSettingsByGroup(group) {
    const settings = await settingsRepository.getAllByGroup(group);
    const result = {};
    settings.forEach(s => {
      let val = s.setting_value;
      try {
        if (val && (val.startsWith('{') || val.startsWith('['))) {
          val = JSON.parse(val);
        }
      } catch (e) {}
      result[s.setting_key] = val;
    });
    return result;
  }

  /**
   * Generic setting setter
   */
  async saveSetting(key, value, group = 'general') {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return await settingsRepository.setByKey(key, stringValue, group);
  }

  async getSystemModules() {
    return await settingsRepository.getSystemModules();
  }

  async updateSystemModules(modules) {
    for (const [key, is_enabled] of Object.entries(modules)) {
      await settingsRepository.updateSystemModule(key, is_enabled);
    }
  }
}

module.exports = new SettingsService();
