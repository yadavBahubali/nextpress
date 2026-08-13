import axiosInstance from '@/lib/axios';

export interface Job {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string | null;
  status: 'published' | 'closed' | 'draft';
  attachment_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationNote {
  text: string;
  user_name: string;
  timestamp: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  job_title?: string;
  department?: string;
  name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  resume_path: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'offered' | 'hired' | 'rejected';
  internal_notes?: JobApplicationNote[];
  created_at: string;
}

const careersService = {
  // --- Dashboard ---
  getHrDashboard: async () => {
    const response = await axiosInstance.get('/careers/dashboard');
    return response.data.data;
  },

  // --- Jobs ---
  getAllJobs: async () => {
    const response = await axiosInstance.get('/careers/jobs');
    return response.data.data as Job[];
  },

  getJobById: async (id: number) => {
    const response = await axiosInstance.get(`/careers/jobs/${id}`);
    return response.data.data as Job;
  },

  createJob: async (data: FormData | Partial<Job>) => {
    let headers = {};
    if (data instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await axiosInstance.post('/careers/jobs', data, { headers });
    return response.data.data;
  },

  updateJob: async (id: number, data: FormData | Partial<Job>) => {
    let headers = {};
    if (data instanceof FormData) {
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await axiosInstance.put(`/careers/jobs/${id}`, data, { headers });
    return response.data;
  },

  deleteJob: async (id: number) => {
    const response = await axiosInstance.delete(`/careers/jobs/${id}`);
    return response.data;
  },

  // --- Applications ---
  getAllApplications: async (jobId?: number) => {
    const url = jobId ? `/careers/applications?jobId=${jobId}` : '/careers/applications';
    const response = await axiosInstance.get(url);
    return response.data.data as JobApplication[];
  },

  getApplicationById: async (id: number) => {
    const response = await axiosInstance.get(`/careers/applications/${id}`);
    return response.data.data as JobApplication;
  },

  updateApplicationStatus: async (id: number, status: string) => {
    const response = await axiosInstance.put(`/careers/applications/${id}/status`, { status });
    return response.data;
  },

  addApplicationNote: async (id: number, text: string) => {
    const response = await axiosInstance.post(`/careers/applications/${id}/notes`, { text });
    return response.data;
  },

  deleteApplication: async (id: number) => {
    const response = await axiosInstance.delete(`/careers/applications/${id}`);
    return response.data;
  }
};

export default careersService;
