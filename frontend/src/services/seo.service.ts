import axios from '@/lib/axios';

export interface SeoMeta {
  id?: number;
  entity_type: string;
  entity_id: number | null;
  source_path?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_type?: string;
  schema_json?: any;
  is_noindex?: boolean;
  is_nofollow?: boolean;
  canonical_url?: string;
  redirect_url?: string;
  redirect_type?: number;
  seo_score?: number;
  sitemap_include?: boolean;
  sitemap_priority?: number;
  sitemap_changefreq?: string;
  title_separator?: string;
  schema_custom?: string;
}

export const seoService = {
  async getSeo(entityType: string, entityId: number | string | null) {
    const id = entityId === null ? 'null' : entityId;
    const response = await axios.get(`/seo/${entityType}/${id}`);
    return response.data;
  },

  async getGlobalSeo() {
    const response = await axios.get('/seo/global');
    return response.data;
  },

  async upsertSeo(entityType: string, entityId: number | string | null, data: Partial<SeoMeta>) {
    const id = entityId === null ? 'null' : entityId;
    const response = await axios.put(`/seo/${entityType}/${id}`, data);
    return response.data;
  },

  async getRedirects() {
    const response = await axios.get('/seo/redirects');
    return response.data;
  },

  async getSiteHealth() {
    const response = await axios.get('/seo/health');
    return response.data;
  },

  async saveRobotsTxt(content: string) {
    const response = await axios.post('/seo/robots/save', { content });
    return response.data;
  },

  async getSitemapEntries() {
    const response = await axios.get('/seo/sitemap/entries');
    return response.data;
  },

  async generateSeoFiles() {
    const response = await axios.post('/seo/generate-files');
    return response.data;
  },

  async deleteSeo(entityType: string, entityId: number | string | null) {
    const id = entityId === null ? 'null' : entityId;
    const response = await axios.delete(`/seo/${entityType}/${id}`);
    return response.data;
  },

  async deleteSeoById(id: number | string) {
    const response = await axios.delete(`/seo/id/${id}`);
    return response.data;
  }
};
