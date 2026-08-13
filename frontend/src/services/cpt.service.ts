import axios from '@/lib/axios';
import { Field } from '@/types/acf';

export interface CptFieldGroup {
  id: number;
  title: string;
  group_key: string;
  fields: Field[];
}

export interface PostType {
  id: number;
  slug: string;
  label: string;
  singular_label: string;
  icon?: string | null;
  description?: string | null;
  is_public: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface CptEntry {
  id: number;
  post_type_id: number;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  featured_image_id?: number | null;
  featured_image_path?: string | null;
  featured_image_url?: string | null;
  content_json?: Record<string, unknown>;
  order_index?: number;
  author_id?: number | null;
  author_name?: string;
  created_at?: string;
  updated_at?: string;
  // Present on single-entry fetches
  post_type?: PostType;
  // ACF values, nested by field group key: { [groupKey]: { [fieldName]: value } }
  acf?: Record<string, Record<string, unknown>>;
  fieldGroups?: CptFieldGroup[];
}

export const cptService = {
  // --- Post Types (registry) ---
  async getActiveTypes() {
    const response = await axios.get<{ status: string; data: PostType[] }>('/cpt/types/active');
    return response.data;
  },

  async getAllTypes() {
    const response = await axios.get<{ status: string; data: PostType[] }>('/cpt/types');
    return response.data;
  },

  async createType(data: Partial<PostType>) {
    const response = await axios.post<{ status: string; data: PostType }>('/cpt/types', data);
    return response.data;
  },

  async updateType(id: number | string, data: Partial<PostType>) {
    const response = await axios.put<{ status: string; data: PostType }>(`/cpt/types/${id}`, data);
    return response.data;
  },

  async deleteType(id: number | string) {
    const response = await axios.delete(`/cpt/types/${id}`);
    return response.data;
  },

  // --- Entries (admin) ---
  async getEntries(postType: string, params: { status?: string } = {}) {
    const response = await axios.get<{ status: string; data: CptEntry[] }>(`/cpt/${postType}/entries`, { params });
    return response.data;
  },

  async getEntry(id: number | string) {
    const response = await axios.get<{ status: string; data: CptEntry }>(`/cpt/entries/${id}`);
    return response.data;
  },

  async createEntry(postType: string, data: Partial<CptEntry>) {
    const response = await axios.post<{ status: string; data: { id: number } }>(`/cpt/${postType}/entries`, data);
    return response.data;
  },

  async updateEntry(id: number | string, data: Partial<CptEntry>) {
    const response = await axios.put(`/cpt/entries/${id}`, data);
    return response.data;
  },

  async deleteEntry(id: number | string) {
    const response = await axios.delete(`/cpt/entries/${id}`);
    return response.data;
  },

  // --- "Mine" (founder portal - entries assigned to the logged-in account) ---
  async getMyEntries(postType: string) {
    const response = await axios.get<{ status: string; data: CptEntry[] }>(`/cpt/${postType}/mine`);
    return response.data;
  },

  async getMyEntry(id: number | string) {
    const response = await axios.get<{ status: string; data: CptEntry }>(`/cpt/entries/${id}/mine`);
    return response.data;
  },

  async updateMyEntry(id: number | string, contentJson: Record<string, unknown>) {
    const response = await axios.put(`/cpt/entries/${id}/mine`, { content_json: contentJson });
    return response.data;
  },

  // --- Public (published-only) ---
  async getPublicEntries(postType: string) {
    const response = await axios.get<{ status: string; data: CptEntry[] }>(`/cpt/${postType}/public`);
    return response.data;
  },

  async getPublicEntryBySlug(postType: string, slug: string) {
    const response = await axios.get<{ status: string; data: CptEntry }>(`/cpt/${postType}/public/slug/${slug}`);
    return response.data;
  },
};
