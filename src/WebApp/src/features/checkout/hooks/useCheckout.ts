import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkoutApi } from '../api/checkoutApi';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type {
  CreateCheckoutSessionRequest,
  UpdateCheckoutSessionRequest,
} from '../types';

export const CHECKOUT_KEYS = {
  all: ['checkout'] as const,
  session: (id: string) => [...CHECKOUT_KEYS.all, 'session', id] as const,
};

export const useCheckoutSession = (sessionId: string | undefined) => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: CHECKOUT_KEYS.session(sessionId || ''),
    queryFn: () => checkoutApi.getSession(sessionId!),
    enabled: Boolean(sessionId && accessToken),
    retry: false,
  });
};

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: (data: CreateCheckoutSessionRequest) => checkoutApi.createSession(data),
  });
};

export const useUpdateCheckoutSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCheckoutSessionRequest) =>
      checkoutApi.updateSession(sessionId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(CHECKOUT_KEYS.session(sessionId), updated);
    },
  });
};

export const useConfirmCheckoutSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => checkoutApi.confirmSession(sessionId, requestId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: CHECKOUT_KEYS.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: ['basket'] });
    },
  });
};
