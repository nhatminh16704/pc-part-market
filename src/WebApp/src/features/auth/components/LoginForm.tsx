import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, Loader2, Sparkles, UserCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginMutation } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnUrl = (location.state as { from?: string })?.from || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      await login(data);
      navigate(returnUrl, { replace: true });
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(detail);
    }
  };

  const fillDemoAccount = (username: string) => {
    setValue('email', username, { shouldValidate: true });
    setValue('password', 'Pass123$', { shouldValidate: true });
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-[#ff5636] mb-3">
          <UserCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5 font-heading">
          Đăng Nhập Tài Khoản
        </h2>
        <p className="text-sm text-slate-500">
          Hệ thống mua sắm linh kiện máy tính PC Part Market
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
          <span className="font-semibold shrink-0">Lỗi:</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Email hoặc Tên đăng nhập
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="alice hoặc AliceSmith@email.com"
              {...register('email')}
              className={`pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636] ${
                errors.email ? 'border-red-400 focus:ring-red-400' : ''
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636] ${
                errors.password ? 'border-red-400 focus:ring-red-400' : ''
              }`}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full h-11 bg-[#ff5636] hover:bg-[#e63e1c] text-white font-semibold shadow-md shadow-orange-500/20 text-sm mt-2 transition-all cursor-pointer"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang xác thực...
            </>
          ) : (
            'Đăng nhập ngay'
          )}
        </Button>
      </form>

      {/* Demo Account Quick Pick */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mb-2.5 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tài khoản Demo có sẵn (1-click điền)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => fillDemoAccount('AliceSmith@email.com')}
            className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 text-left transition-all cursor-pointer"
          >
            <div className="font-semibold text-slate-800">Alice Smith</div>
            <div className="text-[11px] text-slate-500 truncate">AliceSmith@email.com</div>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('BobSmith@email.com')}
            className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 text-left transition-all cursor-pointer"
          >
            <div className="font-semibold text-slate-800">Bob Smith</div>
            <div className="text-[11px] text-slate-500 truncate">BobSmith@email.com</div>
          </button>
        </div>
      </div>
    </div>
  );
};
