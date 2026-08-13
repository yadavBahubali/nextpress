import axios from '@/lib/axios';

export interface Media {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  dimensions?: string;
  thumbnail_url?: string;
  created_at?: string;
}

export interface GetMediaResponse {
  success: boolean;
  data: Media[];
  total: number;
}

export const mediaService = {
  async getAll(params?: { search?: string; type?: string; page?: number; limit?: number }): Promise<GetMediaResponse> {
    const response = await axios.get('/media', { params });
    return response.data;
  },

  async upload(files: File | File[] | FormData, type: 'image' | 'video' | 'file' = 'file'): Promise<{ success: boolean; data: Media | Media[] }> {
    let formData: FormData;

    if (files instanceof FormData) {
      formData = files;
    } else {
      formData = new FormData();
      if (Array.isArray(files)) {
        files.forEach(file => formData.append('files', file));
      } else {
        // Compatibility for specialized single uploads
        const fieldName = type === 'image' ? 'image' : (type === 'video' ? 'video' : 'files');
        formData.append(fieldName, files);
      }
    }
    
    // Determine endpoint
    let endpoint = '/media/upload';
    if (!(files instanceof FormData) && !Array.isArray(files)) {
      if (type === 'image') endpoint = '/media/upload/image';
      if (type === 'video') endpoint = '/media/upload/video';
    }

    const response = await axios.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Self-service upload for the founder portal (/my) - stores and returns
  // only the single file just sent, no browsing/listing/deleting anything
  // else. Not gated by 'cms.media', unlike every other method here.
  async uploadMine(file: File): Promise<{ success: boolean; data: Media }> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post('/media/upload/mine', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id: number | string, data: Partial<Media>): Promise<{ success: boolean; data: Media }> {
    const response = await axios.patch(`/media/${id}`, data);
    return response.data;
  },

  async delete(id: number | string): Promise<{ success: boolean }> {
    const response = await axios.delete(`/media/${id}`);
    return response.data;
  }
};
