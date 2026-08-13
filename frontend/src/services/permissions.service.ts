import axios from '@/lib/axios';

export interface GrantableSection {
  key: string;
  label: string;
}

export const permissionsService = {
  async getSections(): Promise<GrantableSection[]> {
    const response = await axios.get('/permissions/sections');
    return response.data.data;
  },

  async getMine(): Promise<string[]> {
    const response = await axios.get('/permissions/me');
    return response.data.data;
  },

  async getForUser(userId: number | string): Promise<string[]> {
    const response = await axios.get(`/permissions/user/${userId}`);
    return response.data.data;
  },

  async setForUser(userId: number | string, menuKeys: string[]): Promise<string[]> {
    const response = await axios.put(`/permissions/user/${userId}`, { menuKeys });
    return response.data.data;
  },
};
