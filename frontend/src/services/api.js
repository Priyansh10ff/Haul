import axios from "axios";

// Set VITE_API_URL in frontend/.env (local) or in your host's dashboard (production).
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8001",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default axiosInstance;
