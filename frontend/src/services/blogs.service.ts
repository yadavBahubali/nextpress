import axios from '@/lib/axios';

export interface Post {
  acf: any;
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled';
  featured_image_id?: number;
  featured_image_url?: string;
  hero_image_id?: number;
  hero_image_url?: string;
  author_id: number;
  author_name?: string;
  author_details?: any;
  reading_time?: number;
  show_toc?: boolean | number;
  view_count: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  categories?: any[];
  tags?: any[];
}

export interface GetPostsResponse {
  success: boolean;
  data: Post[];
  total?: number;
}

export const blogsService = {
  async getAll(params?: { search?: string; status?: string; category_id?: number }): Promise<GetPostsResponse> {
    const response = await axios.get('/posts', { params });
    return response.data;
  },

  async getById(id: number | string): Promise<{ success: boolean; data: Post }> {
    const response = await axios.get(`/posts/${id}`);
    return response.data;
  },

  async getBySlug(slug: string): Promise<{ success: boolean; data: Post }> {
    const response = await axios.get(`/posts/slug/${slug}`);
    return response.data;
  },

  async create(data: Partial<Post> & { category_ids?: number[]; tag_ids?: number[] }): Promise<{ success: boolean; data: Post }> {
    const response = await axios.post('/posts', data);
    return response.data;
  },

  async update(id: number | string, data: Partial<Post> & { category_ids?: number[]; tag_ids?: number[] }): Promise<{ success: boolean; data: Post }> {
    const response = await axios.patch(`/posts/${id}`, data);
    return response.data;
  },

  async delete(id: number | string): Promise<{ success: boolean }> {
    const response = await axios.delete(`/posts/${id}`);
    return response.data;
  },

  async getAllCategories(): Promise<{ success: boolean; data: any[] }> {
    const response = await axios.get('/posts/categories');
    return response.data;
  },

  async createCategory(data: { name: string; slug: string; description?: string }): Promise<{ success: boolean; data: any }> {
    const response = await axios.post('/posts/categories', data);
    return response.data;
  },

  async updateCategory(id: number | string, data: { name: string; slug: string; description?: string }): Promise<{ success: boolean; data: any }> {
    const response = await axios.patch(`/posts/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number | string): Promise<{ success: boolean }> {
    const response = await axios.delete(`/posts/categories/${id}`);
    return response.data;
  },

  async getAllTags(): Promise<{ success: boolean; data: any[] }> {
    const response = await axios.get('/posts/tags');
    return response.data;
  },

  async createTag(data: { name: string }): Promise<{ success: boolean; data: any }> {
    const response = await axios.post('/posts/tags', data);
    return response.data;
  }
};
