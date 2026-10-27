import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Search, ShoppingCart, User, MapPin, Phone, ShieldCheck, Wrench, LogOut } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCategories } from '@/features/catalog/hooks/useCatalog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string | null;
  onSelectCategory?: (id: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery = '',
  onSearchChange,
  selectedCategory = null,
  onSelectCategory,
}) => {
  const { openCart, totalCount } = useCart();
  const { data: categories = [] } = useCategories();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200/80">
      {/* Top Support Bar (TTGShop signature style: deep dark teal) */}
      <div className="bg-[#002023] text-white text-[12px] py-1.5 px-4 hidden sm:block">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-6 text-slate-300">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-[#ff5636]" />
              <span>Hệ thống Showroom Hà Nội & TP.HCM</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <Phone className="w-3.5 h-3.5 text-[#ff5636]" />
              <span>Hotline tư vấn: <strong className="text-white font-semibold">1900 8888</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-5 text-slate-300">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bảo hành 1-Đổi-1 30 Ngày</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Tư vấn Build PC miễn phí</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="container-custom py-3 flex items-center justify-between gap-4 sm:gap-6 min-w-0">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => onSelectCategory?.(null)}
          className="flex items-center gap-3 select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5636] to-[#e63e1c] flex items-center justify-center shadow-md shadow-orange-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-heading text-xl font-extrabold tracking-tight leading-none text-slate-900">
              PC PART <span className="text-[#ff5636]">MARKET</span>
            </div>
            <div className="text-[10px] text-slate-500 tracking-wider uppercase font-medium">
              Linh Kiện & Hiệu Năng Cao
            </div>
          </div>
        </Link>

        {/* Global Search Bar (TTGShop style with orange search button) */}
        <div className="flex-1 min-w-0 max-w-xl hidden md:block">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Bạn cần tìm linh kiện gì (CPU, VGA, RAM, Mainboard...)?"
              className="w-full h-10 pl-4 pr-12 rounded-full bg-slate-100/80 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff5636] focus:border-[#ff5636] focus:bg-white transition-all shadow-inner"
            />
            <button
              type="button"
              className="absolute right-1 w-8 h-8 rounded-full bg-[#ff5636] hover:bg-[#e63e1c] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Cart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={openCart}
            className="relative gap-2 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-[#ff5636]" />
            <span className="text-xs font-semibold hidden sm:inline">Giỏ hàng</span>
            {totalCount > 0 && (
              <Badge variant="default" className="bg-[#ff5636] text-white text-[11px] h-5 min-w-[20px] px-1.5 flex items-center justify-center font-bold">
                {totalCount}
              </Badge>
            )}
          </Button>

          {/* User Account / Auth */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm">
                <User className="w-3.5 h-3.5 text-[#ff5636]" />
                <span className="max-w-[110px] sm:max-w-[140px] truncate">{user.userName || user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Đăng xuất"
                className="h-8 px-2 text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Đăng xuất</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
            >
              <Link to="/login">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold hidden sm:inline">Đăng nhập</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Sub-Header Category Pills */}
      {categories.length > 0 && (
        <div className="border-t border-slate-200/80 bg-white py-2">
          <div className="container-custom flex items-center gap-2 overflow-x-auto scrollbar-none text-xs min-w-0">
            <button
              type="button"
              onClick={() => onSelectCategory?.(null)}
              className={`h-7 px-3.5 text-xs font-medium rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === null
                  ? 'bg-[#ff5636] text-white font-bold shadow-sm shadow-orange-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-[#ff5636]'
              }`}
            >
              Tất cả linh kiện
            </button>
            {categories.slice(0, 10).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory?.(cat.id)}
                className={`h-7 px-3.5 text-xs font-medium rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#ff5636] text-white font-bold shadow-sm shadow-orange-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-[#ff5636]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
