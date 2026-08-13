import axios from '@/lib/axios';

export interface Author {
  id?: number;
  name: string;
  slug: string;
  email?: string;
  bio?: string;
  details?: string;
  profile_image_id?: number;
  profile_image_path?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const authorsService = {
  async getAll(): Promise<{ success: boolean; data: Author[] }> {
    const response = await axios.get('/authors');
    // The backend uses 'status' field for success, let's map it if needed
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async getById(id: number | string): Promise<{ success: boolean; data: Author }> {
    const response = await axios.get(`/authors/${id}`);
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async create(data: Partial<Author>): Promise<{ success: boolean; data: Author }> {
    const response = await axios.post('/authors', data);
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async update(id: number | string, data: Partial<Author>): Promise<{ success: boolean; data: Author }> {
    const response = await axios.patch(`/authors/${id}`, data);
    return {
      success: response.data.status === 'success',
      data: response.data.data
    };
  },

  async delete(id: number | string): Promise<{ success: boolean }> {
    const response = await axios.delete(`/authors/${id}`);
    return {
      success: response.data.status === 'success'
    };
  }
};
