// ─── API Utility ─────────────────────────────────────────────────────────────
// Pre-configured axios instance that auto-attaches JWT token
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Proxied to http://localhost:5000 by Vite in dev
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mockprep_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
