import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Loader2, MapPin, User } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileForm } from '@/features/customer/components/ProfileForm';
import { AddressBook } from '@/features/customer/components/AddressBook';

type AccountTab = 'profile' | 'addresses';

export const Account: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: AccountTab = searchParams.get('tab') === 'addresses' ? 'addresses' : 'profile';

  if (isLoading) {
    return (
      <div className="container-custom py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#ff5636] animate-spin mr-2.5" />
        <span className="text-sm text-slate-500 font-medium">Đang kiểm tra đăng nhập...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/account' }} replace />;
  }

  const switchTab = (tab: AccountTab) => {
    setSearchParams(tab === 'profile' ? {} : { tab });
  };

  return (
    <div className="container-custom py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
          Tài Khoản Của Tôi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý hồ sơ cá nhân và sổ địa chỉ giao hàng của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm p-2.5 flex lg:flex-col gap-1.5">
          <button
            type="button"
            onClick={() => switchTab('profile')}
            className={`flex-1 lg:flex-none flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'profile'
                ? 'bg-[#ff5636] text-white shadow-sm shadow-orange-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Hồ sơ cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('addresses')}
            className={`flex-1 lg:flex-none flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
              activeTab === 'addresses'
                ? 'bg-[#ff5636] text-white shadow-sm shadow-orange-500/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Sổ địa chỉ</span>
          </button>
        </aside>

        <section className="lg:col-span-9">
          {activeTab === 'profile' ? <ProfileForm /> : <AddressBook />}
        </section>
      </div>
    </div>
  );
};
