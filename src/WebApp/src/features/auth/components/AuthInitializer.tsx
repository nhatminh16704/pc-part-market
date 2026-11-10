import React, { useEffect, useRef } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';

export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Tránh chạy lặp 2 lần trong React StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initAuth = async () => {
      try {
        // Nếu RAM chưa có AccessToken (F5 hoặc mở tab mới), thử silent refresh qua HttpOnly Cookie
        if (!useAuthStore.getState().accessToken) {
          const res = await authApi.refreshToken();
          useAuthStore.getState().setAccessToken(res.accessToken);
        }
      } catch {
        // Khách vãng lai (chưa đăng nhập) hoặc cookie hết hạn -> bỏ qua nhẹ nhàng
      } finally {
        useAuthStore.getState().setInitialized(true);
      }
    };

    initAuth();
  }, []);

  return <>{children}</>;
};

