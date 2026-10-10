import { apiClient } from '@/lib/axios';
import type { LoginFormData, AuthResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    // Demo or actual auth endpoint
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  },
};
