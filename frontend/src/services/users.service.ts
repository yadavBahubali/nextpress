import axios from '@/lib/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  created_at: string;
  updated_at?: string;
}

export const usersService = {
  async getAll(): Promise<{ success: boolean; data: User[] }> {
    const response = await axios.get('/users');
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async getById(id: number | string): Promise<{ success: boolean; data: User }> {
    const response = await axios.get(`/users/${id}`);
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async create(data: Partial<User & { password?: string; role?: string | number }>): Promise<{ success: boolean; data: User }> {
    const response = await axios.post('/users', data);
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async update(id: number | string, data: Partial<User & { password?: string; role?: string | number }>): Promise<{ success: boolean; data: User }> {
    const response = await axios.patch(`/users/${id}`, data);
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async delete(id: number | string): Promise<{ success: boolean }> {
    const response = await axios.delete(`/users/${id}`);
    return {
      success: response.data.status === 'success'
    };
  }
};
