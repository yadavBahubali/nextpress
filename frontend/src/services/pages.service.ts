import axios from '@/lib/axios';

export interface Page {
  id: number;
  title: string;
  slug: string;
  description?: string;
  seo_title?: string;
  status: 'published' | 'draft';
  featured_image_id?: number | null;
  featured_image_url?: string | null;
  template?: string;
  seo_meta?: any;
  content_json?: any;
  created_at?: string;
  updated_at?: string;
}

export interface GetPagesResponse {
  success: boolean;
  data: Page[];
}

export const pagesService = {
  async getPages() {
    const response = await axios.get<GetPagesResponse>('/pages');
    return response.data;
  },

  async getPage(id: number | string) {
    const response = await axios.get<{ success: boolean; data: Page }>(`/pages/${id}`);
    return response.data;
  },

  async getPageBySlug(slug: string) {
    const response = await axios.get<{ success: boolean; data: Page & { sections?: any[]; acf?: any } }>(`/pages/slug/${slug}`);
    return response.data;
  },

  async createPage(data: Partial<Page>) {
    const response = await axios.post('/pages', data);
    return response.data;
  },

  async updatePage(id: number | string, data: Partial<Page>) {
    const response = await axios.put(`/pages/${id}`, data);
    return response.data;
  },

  async deletePage(id: number | string) {
    const response = await axios.delete(`/pages/${id}`);
    return response.data;
  }
};
