import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://rekaweb-rpl-production.up.railway.app/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Otomatis tambahkan token di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;