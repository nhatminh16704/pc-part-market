import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email hoặc tên đăng nhập không được để trống'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerSchema = z
  .object({
    lastName: z.string().trim().min(1, 'Họ không được để trống'),
    firstName: z.string().trim().min(1, 'Tên không được để trống'),
    email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa (A-Z)')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường (a-z)')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số (0-9)')
      .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$...)'),
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

export interface User {
  id: string;
  email: string;
  userName?: string;
  phoneNumber?: string;
  status: string;
  userType: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn?: number;
}
