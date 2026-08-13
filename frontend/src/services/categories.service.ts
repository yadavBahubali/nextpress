import axios from '@/lib/axios';

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  count?: number;
}

export const categoriesService = {
  async getAll(): Promise<{ success: boolean; data: BlogCategory[] }> {
    const response = await axios.get('/posts/categories'); // I'll need to create this backend route
    return response.data;
  },

  async create(data: Partial<BlogCategory>): Promise<{ success: boolean; data: BlogCategory }> {
    const response = await axios.post('/posts/categories', data);
    return response.data;
  }
};
