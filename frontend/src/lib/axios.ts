// src/lib/axios.ts
import axios from "axios";
import { store } from "@/store";
import { setUser } from "@/store/slices/authSlice";

const instance = axios.create({
  baseURL: typeof window === "undefined" 
    ? process.env.BACKEND_API_URL || "http://localhost:5000/api/v1"
    : process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
type PendingRequest = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let failedQueue: PendingRequest[] = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = ["/auth/login", "/auth/logout", "/auth/refresh"].some(
      (route) => originalRequest?.url?.includes(route)
    );

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh on server-side or if it's already an auth route that failed
      if (typeof window === "undefined" || isAuthRoute) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<void>(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await instance.post("/auth/refresh");
        processQueue(null);
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // Clear client auth state without triggering another logout request.
        store.dispatch(setUser(null));
        
        // Immediate redirect to login if we are in a protected area
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          const search = window.location.search;
          const fullPath = path + search;
          
          const segments = path.split("/").filter(Boolean);
          const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";
          
          // Check if it's an admin route (starts with adminPath)
          const isAdminPath = segments[0] === adminPath;
          const isLogin = path.endsWith("/login");

          if (isAdminPath && !isLogin) {
            window.location.href = `/${adminPath}/login?redirect=${encodeURIComponent(fullPath)}`;
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 means "you're authenticated fine, but not allowed to do this
    // specific thing" - it must never be treated like an invalid session.
    // With per-section permissions (see modules/permissions), an Editor or
    // Viewer with a limited grant will get 403s from ordinary page loads as
    // a matter of course (e.g. dashboard widgets for sections they don't
    // have) - previously clearing auth state and redirecting to /login here
    // meant a still-valid session immediately bounced back to the same
    // page, which 403'd again, forever. Let the calling code's own .catch()
    // handle it instead (most already show a toast or fail silently).

    return Promise.reject(error);
  }
);

export default instance;
