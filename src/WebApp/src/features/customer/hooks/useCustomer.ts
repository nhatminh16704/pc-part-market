import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customerApi';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { AddressFormData, UpdateProfileFormData } from '../types';

export const CUSTOMER_KEYS = {
  all: ['customer'] as const,
  profile: () => [...CUSTOMER_KEYS.all, 'profile'] as const,
  addresses: () => [...CUSTOMER_KEYS.all, 'addresses'] as const,
};

export const useMyProfile = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: CUSTOMER_KEYS.profile(),
    queryFn: customerApi.getMyProfile,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileFormData) => customerApi.updateMyProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(CUSTOMER_KEYS.profile(), updated);
    },
  });
};

export const useUpdateMyAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatarUrl: string) => customerApi.updateMyAvatar(avatarUrl),
    onSuccess: (updated) => {
      queryClient.setQueryData(CUSTOMER_KEYS.profile(), updated);
    },
  });
};

export const useMyAddresses = () => {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: CUSTOMER_KEYS.addresses(),
    queryFn: customerApi.getMyAddresses,
    enabled: Boolean(accessToken),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddressFormData) => customerApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.addresses() });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: AddressFormData }) =>
      customerApi.updateAddress(addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.addresses() });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => customerApi.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.addresses() });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => customerApi.setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.addresses() });
    },
  });
};

