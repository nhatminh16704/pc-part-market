import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Search, ShoppingCart, User, Sparkles } from 'lucide-react';
import { useCartStore } from '@/stores';
import { useCategories } from '@/features/catalog/hooks/useCatalog';
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
  const openCart = useCartStore((state) => state.openCart);
  const totalCount = useCartStore((state) => state.getTotalCount)();
  const { data: categories = [] } = useCategories();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/10">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 px-4 py-1.5 text-xs font-semibold text-center text-white flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5" />
        <span>SỰ KIỆN BUILD PC ĐỈNH CAO - GIẢM ĐẾN 25% CHO COMBO CPU + VGA THÁNG NÀY!</span>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 sm:gap-6 w-full min-w-0">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => onSelectCategory?.(null)}
          className="flex items-center gap-3 select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-heading text-xl font-extrabold tracking-tight leading-none">
              PC PART <span className="gradient-text">MARKET</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase">
              Sàn Linh Kiện Cao Cấp
            </div>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 min-w-0 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Tìm kiếm CPU, VGA, RAM, Mainboard chính hãng..."
              className="w-full h-10 pl-9 pr-4 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={openCart}
            className="relative gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
          >
            <ShoppingCart className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-semibold hidden sm:inline">Giỏ hàng</span>
            {totalCount > 0 && (
              <Badge variant="default" className="bg-sky-500 text-white text-[11px] h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                {totalCount}
              </Badge>
            )}
          </Button>

          {/* User Account Link */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
          >
            <Link to="/login">
              <User className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold hidden sm:inline">Tài khoản</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Sub-Header Category Pills */}
      {categories.length > 0 && (
        <div className="border-t border-white/5 bg-slate-900/40 px-6 py-2">
          <div className="max-w-[1360px] mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <Button
              variant={selectedCategory === null ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSelectCategory?.(null)}
              className={`h-7 px-3 text-xs rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-sky-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Tất cả linh kiện
            </Button>
            {categories.slice(0, 10).map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onSelectCategory?.(cat.id)}
                className={`h-7 px-3 text-xs rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-sky-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
