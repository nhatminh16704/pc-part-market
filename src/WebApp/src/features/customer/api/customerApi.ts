import { apiClient } from '@/lib/axios';
import type {
  AddressFormData,
  CustomerAddress,
  CustomerProfile,
  UpdateProfileFormData,
} from '../types';

export const customerApi = {
  getMyProfile: async (): Promise<CustomerProfile> => {
    const response = await apiClient.get<CustomerProfile>('/customers/me');
    return response.data;
  },

  updateMyProfile: async (data: UpdateProfileFormData): Promise<CustomerProfile> => {
    const payload = {
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      phoneNumber: data.phoneNumber || null,
      avatarUrl: data.avatarUrl || null,
      gender: data.gender || null,
      dateOfBirth: data.dateOfBirth || null,
    };
    const response = await apiClient.put<CustomerProfile>('/customers/me', payload);
    return response.data;
  },

  getMyAddresses: async (): Promise<CustomerAddress[]> => {
    const response = await apiClient.get<CustomerAddress[]>('/customers/me/addresses');
    return response.data;
  },

  createAddress: async (data: AddressFormData): Promise<CustomerAddress> => {
    const payload = {
      ...data,
      postalCode: data.postalCode || null,
      label: data.label || null,
    };
    const response = await apiClient.post<CustomerAddress>('/customers/me/addresses', payload);
    return response.data;
  },

  updateAddress: async (addressId: string, data: AddressFormData): Promise<CustomerAddress> => {
    const payload = {
      ...data,
      postalCode: data.postalCode || null,
      label: data.label || null,
    };
    const response = await apiClient.put<CustomerAddress>(`/customers/me/addresses/${addressId}`, payload);
    return response.data;
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await apiClient.delete(`/customers/me/addresses/${addressId}`);
  },

  setDefaultAddress: async (addressId: string): Promise<CustomerAddress> => {
    const response = await apiClient.patch<CustomerAddress>(`/customers/me/addresses/${addressId}/default`);
    return response.data;
  },
};
