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
    <section id="products-section" className="container-custom mt-10 md:mt-12 min-w-0">
      {/* Section Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Kho Linh Kiện <span className="text-[#ff5636]">Chính Hãng</span>
          </h2>
          <div className="text-slate-500 text-sm mt-1">
            Hiển thị <strong className="text-[#ff5636]">{products.length}</strong> trên{' '}
            <strong className="text-slate-900">{totalCount}</strong> sản phẩm từ kho linh kiện
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAllFilters}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 bg-white shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Xóa bộ lọc</span>
          </Button>
        )}
      </div>

      {/* Filter Toolbar (Clean Light Panel) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 mb-6 shadow-sm flex flex-col gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-center">
          {/* Search by Name */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              className="pl-9 pr-8 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#ff5636] focus-visible:border-[#ff5636]"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSearchChange('')}
                className="absolute right-1.5 h-7 w-7 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Category Select */}
          <div className="relative flex items-center">
            <Layers className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => onSelectCategory(e.target.value || null)}
              className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ff5636] focus:border-[#ff5636] cursor-pointer transition-colors"
            >
              <option value="">Tất cả danh mục linh kiện</option>
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
              className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#ff5636] focus:border-[#ff5636] cursor-pointer transition-colors"
            >
              <option value="">Tất cả thương hiệu</option>
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
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-1 font-medium">
              <SlidersHorizontal className="w-3 h-3 text-[#ff5636]" /> Đang lọc theo:
            </span>

            {searchQuery.trim() && (
              <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-3 bg-orange-50 border-orange-200 text-[#ff5636]">
                <span>Tên: &quot;{searchQuery.trim()}&quot;</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-75"
                  onClick={() => onSearchChange('')}
                />
              </Badge>
            )}

            {currentCategoryObj && (
              <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-3 bg-blue-50 border-blue-200 text-blue-700">
                <span>Danh mục: {currentCategoryObj.name}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-75"
                  onClick={() => onSelectCategory(null)}
                />
              </Badge>
            )}

            {currentBrandObj && (
              <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-3 bg-emerald-50 border-emerald-200 text-emerald-700">
                <span>Thương hiệu: {currentBrandObj.name}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:opacity-75"
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
              className="bg-white border border-slate-200 rounded-2xl h-96 p-4 flex flex-col gap-4 shadow-xs"
            >
              <div className="skeleton h-44 w-full" />
              <div className="skeleton h-5 w-3/5" />
              <div className="skeleton h-8 w-11/12" />
              <div className="skeleton h-6 w-2/5 mt-auto" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 py-16 px-6 text-center rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2 text-slate-900">Không tìm thấy sản phẩm nào</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-5 text-sm">
            Không có kết quả với bộ lọc hiện tại. Hãy thử chọn tiêu chí khác hoặc xóa bộ lọc.
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
            className="disabled:opacity-40 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span>Trang trước</span>
          </Button>

          <div className="text-sm text-slate-600 font-medium px-2">
            Trang <strong className="text-slate-900">{currentPage + 1}</strong> / {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages - 1 || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="disabled:opacity-40 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
          >
            <span>Trang sau</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </section>
  );
};
