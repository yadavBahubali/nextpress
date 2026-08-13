import axios from '@/lib/axios';

export interface AuthorMeta {
  name: string;
  email: string;
  bio?: string;
  details?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export const settingsService = {
  async getAuthorMeta(authorId: number | string): Promise<{ success: boolean; data: AuthorMeta | null }> {
    const response = await axios.get(`/settings/author/${authorId}`);
    return response.data;
  },

  async updateAuthorMeta(authorId: number | string, data: AuthorMeta): Promise<{ success: boolean; data: any }> {
    const response = await axios.post(`/settings/author/${authorId}`, data);
    return response.data;
  },

  async getSetting(key: string): Promise<{ success: boolean; data: any }> {
    const response = await axios.get(`/settings/${key}`);
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async saveSetting(key: string, value: any, group: string = 'general'): Promise<{ success: boolean; message: string }> {
    const response = await axios.post('/settings', { key, value, group });
    return {
      success: response.data.status === 'success',
      message: response.data.message
    };
  },

  async getSystemModules() {
    const response = await axios.get('/settings/modules');
    return response.data;
  },
  
  async updateSystemModules(modules: Record<string, boolean>) {
    const response = await axios.post('/settings/modules', { modules });
    return response.data;
  }
};
