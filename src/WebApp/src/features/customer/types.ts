import { z } from 'zod';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CustomerAddress {
  id: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  postalCode: string | null;
  isDefault: boolean;
  label: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export const updateProfileSchema = z.object({
  lastName: z.string().trim().max(100, 'Họ tối đa 100 ký tự').optional().or(z.literal('')),
  firstName: z.string().trim().max(100, 'Tên tối đa 100 ký tự').optional().or(z.literal('')),
  phoneNumber: z.string().trim().max(20, 'Số điện thoại tối đa 20 ký tự').optional().or(z.literal('')),
  avatarUrl: z.string().trim().max(500, 'Link ảnh tối đa 500 ký tự').optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']).optional(),
  dateOfBirth: z.string().optional().or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  receiverName: z.string().trim().min(1, 'Tên người nhận không được để trống').max(100, 'Tối đa 100 ký tự'),
  receiverPhone: z.string().trim().min(1, 'Số điện thoại không được để trống').max(20, 'Tối đa 20 ký tự'),
  province: z.string().trim().min(1, 'Tỉnh/Thành phố không được để trống').max(100, 'Tối đa 100 ký tự'),
  district: z.string().trim().min(1, 'Quận/Huyện không được để trống').max(100, 'Tối đa 100 ký tự'),
  ward: z.string().trim().min(1, 'Phường/Xã không được để trống').max(100, 'Tối đa 100 ký tự'),
  streetAddress: z.string().trim().min(1, 'Địa chỉ chi tiết không được để trống').max(255, 'Tối đa 255 ký tự'),
  postalCode: z.string().trim().max(20, 'Tối đa 20 ký tự').optional().or(z.literal('')),
  label: z.string().trim().max(50, 'Tối đa 50 ký tự').optional().or(z.literal('')),
  isDefault: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
