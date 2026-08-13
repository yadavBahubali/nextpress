import axiosInstance from '@/lib/axios';

export interface FormField {
  id: string;
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  width?: string;
  options?: string[];
}

export interface FormSettings {
  success_message?: string;
  admin_email?: string;
  email_subject?: string;
  submit_button_text?: string;
  redirect_url?: string;
}

export interface Form {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  fields: FormField[];
  settings: FormSettings;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface FormSubmissionNote {
  text: string;
  user_id: number;
  user_name: string;
  timestamp: string;
}

export interface FormSubmission {
  id: number;
  form_id: number;
  form_title?: string;
  form_slug?: string;
  data: Record<string, any>;
  status: 'unread' | 'read' | 'archived' | 'spam';
  sales_status?: 'new' | 'attempted_contact' | 'meeting_scheduled' | 'qualified' | 'won' | 'lost';
  assigned_to?: number | null;
  assigned_user_name?: string | null;
  internal_notes?: FormSubmissionNote[];
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const formsService = {
  // Public
  getFormBySlug: async (slug: string) => {
    const response = await axiosInstance.get(`/forms/public/${slug}`);
    return response.data.data as Form;
  },

  submitForm: async (slug: string, data: Record<string, unknown>) => {
    const response = await axiosInstance.post(`/forms/submit/${slug}`, data);
    return response.data.data as { submissionId: number; successMessage: string; redirectUrl: string | null };
  },

  // Forms
  getAllForms: async () => {
    const response = await axiosInstance.get('/forms');
    return response.data.data as Form[];
  },

  getFormById: async (id: number) => {
    const response = await axiosInstance.get(`/forms/${id}`);
    return response.data.data as Form;
  },

  createForm: async (data: Partial<Form>) => {
    const response = await axiosInstance.post('/forms', data);
    return response.data.data;
  },

  updateForm: async (id: number, data: Partial<Form>) => {
    const response = await axiosInstance.put(`/forms/${id}`, data);
    return response.data;
  },

  deleteForm: async (id: number) => {
    const response = await axiosInstance.delete(`/forms/${id}`);
    return response.data;
  },

  // Submissions
  getAllSubmissions: async () => {
    const response = await axiosInstance.get('/forms/submissions/all');
    return response.data.data as FormSubmission[];
  },

  getSubmissionsByForm: async (formId: number) => {
    const response = await axiosInstance.get(`/forms/submissions/form/${formId}`);
    return response.data.data as FormSubmission[];
  },

  getSubmissionById: async (id: number) => {
    const response = await axiosInstance.get(`/forms/submissions/${id}`);
    return response.data.data as FormSubmission;
  },

  updateSubmissionStatus: async (id: number, status: string) => {
    const response = await axiosInstance.put(`/forms/submissions/${id}/status`, { status });
    return response.data;
  },

  updateSalesStatus: async (id: number, sales_status: string) => {
    const response = await axiosInstance.put(`/forms/submissions/${id}/sales-status`, { sales_status });
    return response.data;
  },

  assignSubmission: async (id: number, user_id: number | null) => {
    const response = await axiosInstance.put(`/forms/submissions/${id}/assign`, { user_id });
    return response.data;
  },

  addNoteToSubmission: async (id: number, text: string) => {
    const response = await axiosInstance.post(`/forms/submissions/${id}/notes`, { text });
    return response.data;
  },

  deleteSubmission: async (id: number) => {
    const response = await axiosInstance.delete(`/forms/submissions/${id}`);
    return response.data;
  }
};

export default formsService;
