const menusRepository = require('./menus.repository');
const ApiError = require('../../utils/ApiError');

class MenusService {
  async getAllMenus() {
    const menus = await menusRepository.findAll();
    return await Promise.all(menus.map(async (menu) => {
      const items = await menusRepository.findItemsByMenuId(menu.id);
      return { ...menu, items };
    }));
  }

  async getMenuById(id) {
    const menu = await menusRepository.findById(id);
    if (!menu) throw new ApiError(404, 'Menu not found');
    
    // Parse JSON
    if (typeof menu.settings_json === 'string') {
      menu.settings_json = JSON.parse(menu.settings_json);
    }
    
    // Fetch items
    const items = await menusRepository.findItemsByMenuId(id);
    const parsedItems = items.map(item => {
      if (typeof item.settings_json === 'string') {
        item.settings_json = JSON.parse(item.settings_json);
      }
      return item;
    });

    return { ...menu, items: parsedItems };
  }

  async getMenuBySlug(slug) {
    const menu = await menusRepository.findBySlug(slug);
    if (!menu) throw new ApiError(404, 'Menu not found');
    
    // Fetch items
    const items = await menusRepository.findItemsByMenuId(menu.id);
    const parsedItems = items.map(item => {
      if (typeof item.settings_json === 'string') {
        item.settings_json = JSON.parse(item.settings_json);
      }
      return item;
    });

    return { ...menu, items: parsedItems };
  }

  async getMenuByLocation(location) {
    const menu = await menusRepository.findByLocation(location);
    if (!menu) throw new ApiError(404, 'Menu not found for this location');
    
    // Fetch items
    const items = await menusRepository.findItemsByMenuId(menu.id);
    const parsedItems = items.map(item => {
      if (typeof item.settings_json === 'string') {
        item.settings_json = JSON.parse(item.settings_json);
      }
      return item;
    });

    return { ...menu, items: parsedItems };
  }

  async createMenu(data) {
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    // Check if slug exists
    const existing = await menusRepository.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(400, 'A menu with this slug already exists');
    }

    return await menusRepository.create(data);
  }

  async updateMenu(id, data) {
    const existing = await menusRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Menu not found');

    // Check slug collision
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await menusRepository.findBySlug(data.slug);
      if (slugExists) throw new ApiError(400, 'A menu with this slug already exists');
    }

    const updatedData = { ...existing, ...data };
    return await menusRepository.update(id, updatedData);
  }

  async deleteMenu(id) {
    const existing = await menusRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Menu not found');

    return await menusRepository.delete(id);
  }

  async syncMenuItems(menuId, items) {
    const existing = await menusRepository.findById(menuId);
    if (!existing) throw new ApiError(404, 'Menu not found');

    // Expected items format: Flat array sorted properly
    return await menusRepository.syncItems(menuId, items);
  }

  async searchEntities(query) {
    if (query && query.length < 2) return { pages: [], posts: [] };
    return await menusRepository.searchEntities(query);
  }
}

module.exports = new MenusService();