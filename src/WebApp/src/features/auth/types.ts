import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email hoặc tên đăng nhập không được để trống'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  name: z.string().min(1, 'Tên không được để trống'),
  lastName: z.string().min(1, 'Họ không được để trống'),
  phoneNumber: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export interface User {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  phoneNumber?: string;
  role: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}
