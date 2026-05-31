import { create } from "zustand";

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
  logoutStore: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logoutStore: () => set({ user: null, isAuthenticated: false }),
}));
