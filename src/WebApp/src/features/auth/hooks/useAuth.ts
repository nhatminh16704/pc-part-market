import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginFormData, AuthResponse } from '../types';

export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginFormData>({
    mutationFn: (data: LoginFormData) => authApi.login(data),
  });
};
