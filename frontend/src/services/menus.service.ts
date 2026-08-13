import axios from '@/lib/axios';
import { Menu, MenuItem, EntitySearchItem } from '@/types/menu';

export const menusService = {
  async getMenus(): Promise<{ status: string; data: Menu[] }> {
    const response = await axios.get('/menus');
    return response.data;
  },

  async getMenuById(id: number | string): Promise<{ status: string; data: Menu }> {
    const response = await axios.get(`/menus/${id}`);
    return response.data;
  },

  async getMenuBySlug(slug: string): Promise<{ status: string; data: Menu }> {
    const response = await axios.get(`/menus/slug/${slug}`);
    return response.data;
  },

  async getMenuByLocation(location: string): Promise<{ status: string; data: Menu }> {
    const response = await axios.get(`/menus/location/${location}`);
    return response.data;
  },

  async createMenu(data: Partial<Menu>): Promise<{ status: string; data: { id: number }; message: string }> {
    const response = await axios.post('/menus', data);
    return response.data;
  },

  async updateMenu(id: number | string, data: Partial<Menu>): Promise<{ status: string; message: string }> {
    const response = await axios.put(`/menus/${id}`, data);
    return response.data;
  },

  async deleteMenu(id: number | string): Promise<{ status: string; message: string }> {
    const response = await axios.delete(`/menus/${id}`);
    return response.data;
  },

  async syncMenuItems(id: number | string, items: MenuItem[]): Promise<{ status: string; message: string }> {
    const response = await axios.post(`/menus/${id}/sync`, { items });
    return response.data;
  },

  async searchEntities(query: string): Promise<{ status: string; data: { pages: EntitySearchItem[], posts: EntitySearchItem[] } }> {
    const response = await axios.get(`/menus/entities/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
