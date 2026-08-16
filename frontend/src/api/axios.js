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
      const requestUrl = error.config?.url || "";
      const isCustomerOrderRoute = requestUrl.includes("/api/orders/customer/");
      const isAdminRoute =
        (!isCustomerOrderRoute && requestUrl.includes("/api/orders")) ||
        requestUrl.includes("/api/items");

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
