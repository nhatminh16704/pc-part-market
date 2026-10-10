import React from 'react';
import { ProductCard } from './ProductCard';
import type { Brand, Category, Product } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Tag, 
  Layers 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ProductSectionProps {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  categories: Category[];
  brands: Brand[];
  selectedCategory: string | null;
  selectedBrand: string | null;
  searchQuery: string;
  onPageChange: (newPage: number) => void;
  onQuickView: (product: Product) => void;
  onSelectCategory: (id: string | null) => void;
  onSelectBrand: (id: string | null) => void;
  onSearchChange: (query: string) => void;
  onClearAllFilters: () => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  totalCount,
  currentPage,
  pageSize,
  isLoading,
  categories,
  brands,
  selectedCategory,
  selectedBrand,
  searchQuery,
  onPageChange,
  onQuickView,
  onSelectCategory,
  onSelectBrand,
  onSearchChange,
  onClearAllFilters,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);
  const currentBrandObj = brands.find((b) => b.id === selectedBrand);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedCategory ||
    selectedBrand
  );

  return (
    <section id="products-section" className="max-w-[1360px] mx-auto mt-12 px-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Kho Linh Kiện <span className="gradient-text">Chính Hãng</span>
          </h2>
          <div className="text-slate-400 text-sm mt-1">
            Hiển thị <strong className="text-sky-400">{products.length}</strong> trên{' '}
            <strong className="text-white">{totalCount}</strong> sản phẩm từ API Catalog
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllFilters}
            className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Xóa bộ lọc</span>
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 md:p-5 rounded-2xl mb-6 flex flex-col gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-center">
          {/* Search by Name */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên sản phẩm (API: ?name=)..."
              className="pl-9 pr-8 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus-visible:ring-sky-400 focus-visible:border-sky-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Select */}
          <div className="relative flex items-center">
            <Layers className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => onSelectCategory(e.target.value || null)}
              className="w-full h-10 pl-9 pr-4 bg-slate-900/90 border border-white/10 rounded-md text-sm text-slate-200 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 cursor-pointer transition-colors"
            >
              <option value="">Tất cả danh mục (API: ?categoryId=)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Select */}
          <div className="relative flex items-center">
            <Tag className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedBrand || ''}
              onChange={(e) => onSelectBrand(e.target.value || null)}
              className="w-full h-10 pl-9 pr-4 bg-slate-900/90 border border-white/10 rounded-md text-sm text-slate-200 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 cursor-pointer transition-colors"
            >
              <option value="">Tất cả thương hiệu (API: ?brandId=)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mr-1">
              <SlidersHorizontal className="w-3 h-3" /> Đang lọc theo:
            </span>

            {searchQuery.trim() && (
              <Badge variant="sky" className="flex items-center gap-1.5 py-1 px-3">
                <span>Tên: &quot;{searchQuery.trim()}&quot;</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => onSearchChange('')}
                />
              </Badge>
            )}

            {currentCategoryObj && (
              <Badge variant="purple" className="flex items-center gap-1.5 py-1 px-3">
                <span>Danh mục: {currentCategoryObj.name}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => onSelectCategory(null)}
                />
              </Badge>
            )}

            {currentBrandObj && (
              <Badge variant="emerald" className="flex items-center gap-1.5 py-1 px-3">
                <span>Thương hiệu: {currentBrandObj.name}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => onSelectBrand(null)}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="glass-panel h-96 p-4 flex flex-col gap-4"
            >
              <div className="skeleton h-44 w-full" />
              <div className="skeleton h-5 w-3/5" />
              <div className="skeleton h-8 w-11/12" />
              <div className="skeleton h-6 w-2/5 mt-auto" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel py-16 px-6 text-center rounded-2xl">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Không tìm thấy sản phẩm nào</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-5 text-sm">
            Không có kết quả trả về từ API Catalog với bộ lọc hiện tại. Hãy thử chọn tiêu chí khác hoặc xóa bộ lọc.
          </p>
          {hasActiveFilters && (
            <Button
              variant="glow"
              onClick={onClearAllFilters}
              className="inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xóa bộ lọc</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 0 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Trang trước</span>
          </Button>

          <div className="text-sm text-slate-400 font-medium px-2">
            Trang <strong className="text-white">{currentPage + 1}</strong> / {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1 || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="disabled:opacity-40"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </section>
  );
};
