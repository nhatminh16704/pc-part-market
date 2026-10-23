import { apiClient } from '@/lib/axios';
import type { LoginFormData, AuthResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    // Auth endpoint via gateway
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
};
