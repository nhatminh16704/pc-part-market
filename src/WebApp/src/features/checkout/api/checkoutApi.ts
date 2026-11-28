import { apiClient } from '@/lib/axios';
import type {
  CheckoutSession,
  ConfirmCheckoutResponse,
  CreateCheckoutSessionRequest,
  UpdateCheckoutSessionRequest,
} from '../types';

export const checkoutApi = {
  createSession: async (data: CreateCheckoutSessionRequest): Promise<CheckoutSession> => {
    const response = await apiClient.post<CheckoutSession>('/checkout-sessions', data);
    return response.data;
  },

  getSession: async (sessionId: string): Promise<CheckoutSession> => {
    const response = await apiClient.get<CheckoutSession>(`/checkout-sessions/${sessionId}`);
    return response.data;
  },

  updateSession: async (
    sessionId: string,
    data: UpdateCheckoutSessionRequest
  ): Promise<CheckoutSession> => {
    const response = await apiClient.patch<CheckoutSession>(`/checkout-sessions/${sessionId}`, data);
    return response.data;
  },

  confirmSession: async (
    sessionId: string,
    requestId: string
  ): Promise<ConfirmCheckoutResponse> => {
    const response = await apiClient.post<ConfirmCheckoutResponse>(
      `/checkout-sessions/${sessionId}/confirm`,
      {},
      {
        headers: {
          'x-requestid': requestId,
        },
      }
    );
    return response.data;
  },
};
