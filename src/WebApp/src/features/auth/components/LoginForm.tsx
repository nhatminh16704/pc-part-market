import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, Phone, Loader2, Sparkles, UserCheck, UserPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register: registerUser, googleLogin, loginMutation, registerMutation, googleLoginMutation } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(
    location.pathname === '/register' ? 'register' : 'login'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const returnUrl = (location.state as { from?: string })?.from || '/';

  // Login Form
  const {
    register: registerLoginField,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register Form
  const {
    register: registerRegisterField,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      phoneNumber: '',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    try {
      await login(data);
      navigate(returnUrl, { replace: true });
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(detail);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null);
    try {
      await registerUser(data);
      navigate(returnUrl, { replace: true });
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setErrorMessage(detail);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMessage('Không nhận được token xác thực từ Google.');
      return;
    }
    setErrorMessage(null);
    try {
      await googleLogin(credentialResponse.credential);
      navigate(returnUrl, { replace: true });
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Đăng nhập Google thất bại. Vui lòng thử lại.';
      setErrorMessage(detail);
    }
  };

  const fillDemoAccount = (username: string) => {
    setLoginValue('email', username, { shouldValidate: true });
    setLoginValue('password', 'Pass123$', { shouldValidate: true });
    setErrorMessage(null);
  };

  const isPending = loginMutation.isPending || registerMutation.isPending || googleLoginMutation.isPending;

  return (
    <div className="w-full max-w-md p-8 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 text-[#ff5636] mb-3">
          {mode === 'login' ? <UserCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-1.5 font-heading">
          {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
        </h2>
        <p className="text-sm text-slate-500">
          Hệ thống mua sắm linh kiện máy tính PC Part Market
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => { setMode('login'); setErrorMessage(null); }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => { setMode('register'); setErrorMessage(null); }}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Đăng ký
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
          <span className="font-semibold shrink-0">Lỗi:</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email hoặc Tên đăng nhập
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="alice hoặc AliceSmith@email.com"
                {...registerLoginField('email')}
                className={`pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636] ${
                  loginErrors.email ? 'border-red-400 focus:ring-red-400' : ''
                }`}
              />
            </div>
            {loginErrors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{loginErrors.email.message}</p>
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
                {...registerLoginField('password')}
                className={`pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636] ${
                  loginErrors.password ? 'border-red-400 focus:ring-red-400' : ''
                }`}
              />
            </div>
            {loginErrors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{loginErrors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
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
      ) : (
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email đăng ký
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="email@example.com"
                {...registerRegisterField('email')}
                className={`pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636] ${
                  registerErrors.email ? 'border-red-400 focus:ring-red-400' : ''
                }`}
              />
            </div>
            {registerErrors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{registerErrors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="password"
                placeholder="••••••••"
                {...registerRegisterField('password')}
                className={`pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636] ${
                  registerErrors.password ? 'border-red-400 focus:ring-red-400' : ''
                }`}
              />
            </div>
            {registerErrors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{registerErrors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Số điện thoại (tùy chọn)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="tel"
                placeholder="0912345678"
                {...registerRegisterField('phoneNumber')}
                className="pl-10 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-[#ff5636] hover:bg-[#e63e1c] text-white font-semibold shadow-md shadow-orange-500/20 text-sm mt-2 transition-all cursor-pointer"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              'Tạo tài khoản mới'
            )}
          </Button>
        </form>
      )}

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <div className="flex justify-center w-full min-h-[40px]">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setErrorMessage('Đăng nhập Google thất bại. Vui lòng thử lại.')}
          useOneTap={false}
          theme="outline"
          shape="rectangular"
          size="large"
          width="384"
          text={mode === 'login' ? 'signin_with' : 'signup_with'}
        />
      </div>

      {/* Demo Account Quick Pick for Login */}
      {mode === 'login' && (
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
      )}
    </div>
  );
};
