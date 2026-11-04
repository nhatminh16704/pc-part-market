import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setAuth: (accessToken: string, user: User | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setAuth: (accessToken, user) => set({ accessToken, user }),
  clearAuth: () => set({ accessToken: null, user: null }),
}));

// Helper functions để truy xuất nhanh ngoài React (vd: axios interceptors)
export const getAccessToken = () => useAuthStore.getState().accessToken;
export const setAccessToken = (token: string | null) => useAuthStore.getState().setAccessToken(token);
export const getUser = () => useAuthStore.getState().user;
