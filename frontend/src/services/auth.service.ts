import api from "@/lib/axios";

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  async me() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  async getUsers() {
    const response = await api.get("/auth/users");
    return response.data;
  },

  async createAuthor(data: { name: string; email: string }) {
    // This will hit a standard registration or specialized author creation endpoint
    const response = await api.post("/auth/register", {
      ...data,
      password: "AuthorPassword123!", // Temporary placeholder, user should change
    });
    return response.data;
  },

  async refreshToken() {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};