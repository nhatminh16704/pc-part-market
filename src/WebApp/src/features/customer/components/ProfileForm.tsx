import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Mail, Phone, User, Calendar, ImageIcon } from 'lucide-react';
import { useMyProfile, useUpdateMyProfile } from '../hooks/useCustomer';
import { updateProfileSchema, type UpdateProfileFormData } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ProfileForm: React.FC = () => {
  const { data: profile, isLoading, isError } = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      lastName: '',
      firstName: '',
      phoneNumber: '',
      avatarUrl: '',
      gender: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        lastName: profile.lastName ?? '',
        firstName: profile.firstName ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        avatarUrl: profile.avatarUrl ?? '',
        gender: profile.gender ?? '',
        dateOfBirth: profile.dateOfBirth ?? '',
      });
    }
  }, [profile, reset]);

  const avatarPreview = watch('avatarUrl');
  const firstNameWatch = watch('firstName');
  const lastNameWatch = watch('lastName');

  const onSubmit = async (data: UpdateProfileFormData) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync(data);
      setSuccessMessage('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.title ||
        err.message ||
        'Không thể cập nhật hồ sơ. Vui lòng thử lại.';
      setErrorMessage(detail);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-6 h-6 text-[#ff5636] animate-spin mr-2.5" />
        <span className="text-sm text-slate-500 font-medium">Đang tải hồ sơ cá nhân...</span>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-8 bg-white border border-red-200 rounded-2xl shadow-sm text-center">
        <p className="text-sm text-red-600 font-medium">
          Không thể tải thông tin hồ sơ. Vui lòng thử tải lại trang.
        </p>
      </div>
    );
  }

  const initials = `${(lastNameWatch || profile.email)[0] || 'U'}${(firstNameWatch || '')[0] || ''}`.toUpperCase();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 mb-6 border-b border-slate-100">
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-orange-100 shadow-sm bg-slate-100 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ff5636] to-[#e63e1c] text-white font-bold text-xl flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            {initials}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-heading">Hồ sơ cá nhân</h2>
          <p className="text-sm text-slate-500">
            Quản lý thông tin liên hệ để đặt hàng và nhận ưu đãi thành viên.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <span className="font-semibold">Lỗi: </span>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Email tài khoản
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="email"
              value={profile.email}
              disabled
              className="pl-10 h-11 bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Họ
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Nguyễn"
                {...register('lastName')}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636]"
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tên
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Minh"
                {...register('firstName')}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636]"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.firstName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="tel"
                placeholder="0912345678"
                {...register('phoneNumber')}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636]"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Ngày sinh
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="date"
                {...register('dateOfBirth')}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636]"
              />
            </div>
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Giới tính
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'MALE', label: 'Nam' },
              { value: 'FEMALE', label: 'Nữ' },
              { value: 'OTHER', label: 'Khác' },
            ].map((item) => (
              <label
                key={item.value}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50/50 cursor-pointer text-sm font-medium text-slate-700"
              >
                <input
                  type="radio"
                  value={item.value}
                  {...register('gender')}
                  className="accent-[#ff5636]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Link ảnh đại diện (Avatar URL)
          </label>
          <div className="relative">
            <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              {...register('avatarUrl')}
              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#ff5636] focus:ring-[#ff5636]"
            />
          </div>
          {errors.avatarUrl && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.avatarUrl.message}</p>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={updateMutation.isPending || !isDirty}
            className="h-11 px-6 bg-[#ff5636] hover:bg-[#e63e1c] text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
