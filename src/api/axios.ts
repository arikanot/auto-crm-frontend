import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.1.31:8000", // <-- Меняем localhost на твой точный IP бэкенда
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

export const getCsrfCookie = () => api.get("/sanctum/csrf-cookie");

export default api;
