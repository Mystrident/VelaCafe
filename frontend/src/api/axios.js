import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  if (!config.headers.Authorization) {
    const adminToken = localStorage.getItem("token");
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute =
        error.config?.url?.includes("/api/orders") ||
        error.config?.url?.includes("/api/items");

      if (isAdminRoute) {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          alert("Session expired. Please login again.");
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
