import axios from "axios";

// We use a basic axios instance here because the main one might have interceptors 
// that depend on a working API URL or store which might not be ready
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupService = {
  getStatus: async () => {
    try {
      const response = await api.get("/setup/status");
      return response.data;
    } catch (error: any) {
      return { status: 'error', message: error.message };
    }
  },

  testConnection: async (config: any) => {
    const response = await api.post("/setup/test-connection", config);
    return response.data;
  },

  install: async (data: any) => {
    const response = await api.post("/setup/install", data);
    return response.data;
  },
};
