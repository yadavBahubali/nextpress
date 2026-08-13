import api from "@/lib/axios";

export const designerService = {
  getRoomTemplates: async () => {
    const response = await api.get("/designer/templates");
    return response.data;
  },

  getRecommendations: async (params: { room_type_id: number; length: number; seats: number }) => {
    const response = await api.post("/designer/recommendations", params);
    return response.data;
  },

  saveConfiguration: async (data: any) => {
    const response = await api.post("/designer/configurations", data);
    return response.data;
  },

  generateQuotation: async (configId: number) => {
    const response = await api.post(`/designer/quotations/${configId}`);
    return response.data;
  }
};
