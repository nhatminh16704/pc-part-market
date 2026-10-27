import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginFormData, RegisterFormData, AuthResponse, User } from '../types';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  currentUser: () => [...AUTH_KEYS.all, 'me'] as const,
};

const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user_info');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useCurrentUser = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  return useQuery<User | null>({
    queryKey: AUTH_KEYS.currentUser(),
    queryFn: async () => {
      try {
        return await authApi.getCurrentUser();
      } catch {
        // If token expired or invalid, clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        return null;
      }
    },
    enabled: Boolean(token),
    initialData: getStoredUser,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginFormData>({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      queryClient.setQueryData(AUTH_KEYS.currentUser(), data.user);
      // Invalidate basket so the authenticated user's cart on Redis is loaded
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterFormData>({
    mutationFn: (data: RegisterFormData) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      queryClient.setQueryData(AUTH_KEYS.currentUser(), data.user);
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    },
  });
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    queryClient.setQueryData(AUTH_KEYS.currentUser(), null);
    // Refresh basket back to guest state
    queryClient.invalidateQueries({ queryKey: ['basket'] });
  };

  return {
    user: user ?? null,
    isAuthenticated: Boolean(user && localStorage.getItem('access_token')),
    isLoading: isUserLoading || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutateAsync,
    loginMutation,
    register: registerMutation.mutateAsync,
    registerMutation,
    logout,
  };
};
