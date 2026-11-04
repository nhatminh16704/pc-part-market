import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';
import type { LoginFormData, RegisterFormData, AuthResponse, User } from '../types';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  currentUser: () => [...AUTH_KEYS.all, 'me'] as const,
};

export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: AUTH_KEYS.currentUser(),
    queryFn: async () => {
      try {
        // Nếu RAM chưa có AccessToken (F5 hoặc mở tab mới), thử silent refresh qua HttpOnly Cookie
        if (!useAuthStore.getState().accessToken) {
          try {
            const tokenRes = await authApi.refreshToken();
            useAuthStore.getState().setAccessToken(tokenRes.accessToken);
          } catch {
            return null;
          }
        }
        const user = await authApi.getCurrentUser();
        useAuthStore.getState().setUser(user);
        return user;
      } catch {
        useAuthStore.getState().clearAuth();
        return null;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 phút
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginFormData>({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: async (data) => {
      useAuthStore.getState().setAccessToken(data.accessToken);
      try {
        const user = await authApi.getCurrentUser();
        useAuthStore.getState().setUser(user);
        queryClient.setQueryData(AUTH_KEYS.currentUser(), user);
      } catch {
        // Fallback: trigger background refetch
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser() });
      }
      // Invalidate basket so the authenticated user's cart on Redis is loaded
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterFormData>({
    mutationFn: (data: RegisterFormData) => authApi.register(data),
    onSuccess: async (data) => {
      useAuthStore.getState().setAccessToken(data.accessToken);
      try {
        const user = await authApi.getCurrentUser();
        useAuthStore.getState().setUser(user);
        queryClient.setQueryData(AUTH_KEYS.currentUser(), user);
      } catch {
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.currentUser() });
      }
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    },
  });
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { accessToken, user: storeUser } = useAuthStore();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const currentUser = user ?? storeUser;
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      useAuthStore.getState().clearAuth();
      queryClient.setQueryData(AUTH_KEYS.currentUser(), null);
      // Refresh basket back to guest state
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    }
  };

  return {
    user: currentUser,
    accessToken,
    isAuthenticated: Boolean(currentUser && accessToken),
    isLoading: isUserLoading || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutateAsync,
    loginMutation,
    register: registerMutation.mutateAsync,
    registerMutation,
    logout,
  };
};
