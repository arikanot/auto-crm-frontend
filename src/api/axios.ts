import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // URL твоего Laravel бэкенда
  withCredentials: true, // КРИТИЧЕСКИ ВАЖНО для передачи HttpOnly-кук
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Функция для получения CSRF-куки перед важными запросами (логин, регистрация)
export const getCsrfCookie = () => api.get("/sanctum/csrf-cookie");

export default api;
