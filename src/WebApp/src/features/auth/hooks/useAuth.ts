import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { getAccessToken, setAccessToken } from '@/lib/axios';
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
        if (!getAccessToken()) {
          try {
            const tokenRes = await authApi.refreshToken();
            setAccessToken(tokenRes.accessToken);
          } catch {
            return null;
          }
        }
        return await authApi.getCurrentUser();
      } catch {
        setAccessToken(null);
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
      setAccessToken(data.accessToken);
      try {
        const user = await authApi.getCurrentUser();
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
      setAccessToken(data.accessToken);
      try {
        const user = await authApi.getCurrentUser();
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
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi mạng khi logout
    } finally {
      setAccessToken(null);
      queryClient.setQueryData(AUTH_KEYS.currentUser(), null);
      // Refresh basket back to guest state
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    }
  };

  return {
    user: user ?? null,
    isAuthenticated: Boolean(user && getAccessToken()),
    isLoading: isUserLoading || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutateAsync,
    loginMutation,
    register: registerMutation.mutateAsync,
    registerMutation,
    logout,
  };
};
