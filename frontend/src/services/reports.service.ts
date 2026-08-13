import api from "@/lib/axios";

export const reportsService = {
  async getSalesDashboard() {
    const res = await api.get('/reports/sales-dashboard');
    return res.data;
  },
  async getEcommerceDashboard() {
    const res = await api.get('/reports/ecommerce-dashboard');
    return res.data;
  },
  async getHrDashboard() {
    const res = await api.get('/reports/hr-dashboard');
    return res.data;
  },
  async getGeneralDashboard() {
    const res = await api.get('/reports/general-dashboard');
    return res.data;
  },
  async getNotifications() {
    const res = await api.get('/reports/notifications');
    return res.data;
  }
};
