// src/service/acf.service.ts

import axios from '@/lib/axios';

export interface ACFGroup {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  group_key: string;
  key?: string; // mapped for UI
  status: "active" | "inactive" | string;
  fields?: any[];
  fields_json?: any[];
  location_rules_json?: any;
  fieldsCount?: number;
  page_id?: number | null;
  order_index?: number;
  created_at?: string;
}

export interface GetGroupsResponse {
  groups: ACFGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Helper to recursively ensure fields have IDs for the UI
const ensureFieldIds = (fields: any[]): any[] => {
  if (!Array.isArray(fields)) return [];
  return fields.map(field => ({
    ...field,
    id: field.id || field.key || crypto.randomUUID(),
    subFields: ensureFieldIds(field.sub_fields || field.subFields)
  }));
};

const mapGroupData = (group: any) => {
  const parsedFields = typeof group.fields === 'string' ? JSON.parse(group.fields || '[]') : (group.fields || []);
  const isActive = group.active === 1 || group.active === true || group.active === "1";
  
  return {
    ...group,
    key: group.group_key, // map group_key to key for components
    status: isActive ? "active" : "inactive",
    fields: ensureFieldIds(parsedFields),
    fieldsCount: parsedFields.length,
    page_id: group.page_id || null,
    order_index: group.order_index || 0
  };
};

export const acfService = {
  async getGroups(search = "", page = 1, limit = 10): Promise<GetGroupsResponse> {
    const response = await axios.get("/acf/groups", {
      params: {
        search,
        page,
        limit
      },
    });

    // The backend returns { status: 'success', data: groups[], total: count }
    const rawData = response.data?.data || [];
    const groups = rawData.map(mapGroupData);

    return {
      groups,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: response.data?.total || 0,
        totalPages: Math.ceil((response.data?.total || 0) / limit)
      }
    };
  },

  async getGroupsForPage(pageId: string | number): Promise<ACFGroup[]> {
    const response = await axios.get(`/acf/groups/for-page/${pageId}`);
    const rawData = response.data?.data || [];
    return rawData.map(mapGroupData);
  },

  async getGroupsForPost(postId: string | number): Promise<ACFGroup[]> {
    const response = await axios.get(`/acf/groups/for-post/${postId}`);
    const rawData = response.data?.data || [];
    return rawData.map(mapGroupData);
  },

  async getGroupsForPostType(postTypeSlug: string): Promise<ACFGroup[]> {
    const response = await axios.get(`/acf/groups/for-post-type/${postTypeSlug}`);
    const rawData = response.data?.data || [];
    return rawData.map(mapGroupData);
  },

  async getGroup(id: string | number): Promise<ACFGroup> {
    const response = await axios.get(`/acf/groups/${id}`);

    // Backend returns { status: 'success', data: groupObject }
    const group = response.data.data;
    return mapGroupData(group);
  },

  async createGroup(payload: any) {
    const response = await axios.post('/acf/groups', payload);
    return response.data;
  },

  async updateGroup(id: string | number, payload: any) {
    const response = await axios.put(`/acf/groups/${id}`, payload);
    return response.data.data;
  },

  async deleteGroup(id: string | number) {
    const response = await axios.delete(`/acf/groups/${id}`);
    return response.data;
  },
};