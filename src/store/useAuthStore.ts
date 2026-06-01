import { create } from "zustand";
import api from "../api/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "mechanic";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: async () => {
    try {
      // Шлем запрос на Laravel для удаления сессии
      await api.post("/api/logout");
    } catch (error) {
      console.error("Ошибка при выходе на бэкенде:", error);
    } finally {
      // В любом случае чистим стейт на фронте, чтобы не блокировать интерфейс
      set({ user: null, isAuthenticated: false });
    }
  },
}));
