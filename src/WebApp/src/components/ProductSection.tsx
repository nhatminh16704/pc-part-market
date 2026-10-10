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
  Layers, 
  DollarSign, 
  ArrowUpDown 
} from 'lucide-react';

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
  sortBy: string;
  priceRange: string;
  onPageChange: (newPage: number) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onSelectCategory: (id: string | null) => void;
  onSelectBrand: (id: string | null) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
  onPriceRangeChange: (range: string) => void;
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
  sortBy,
  priceRange,
  onPageChange,
  onAddToCart,
  onQuickView,
  onSelectCategory,
  onSelectBrand,
  onSearchChange,
  onSortChange,
  onPriceRangeChange,
  onClearAllFilters,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);
  const currentBrandObj = brands.find((b) => b.id === selectedBrand);

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case 'under_10':
        return 'Dưới 10 triệu';
      case '10_25':
        return '10 - 25 triệu';
      case 'over_25':
        return 'Trên 25 triệu';
      default:
        return '';
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedCategory ||
    selectedBrand ||
    (priceRange && priceRange !== 'all')
  );

  return (
    <section
      id="products-section"
      style={{
        maxWidth: '1360px',
        margin: '48px auto 0',
        padding: '0 24px',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            Kho Linh Kiện <span className="gradient-text">Chính Hãng</span>
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            Hiển thị <strong style={{ color: 'var(--accent-sky)' }}>{products.length}</strong> trên{' '}
            <strong style={{ color: '#fff' }}>{totalCount}</strong> sản phẩm sẵn sàng xuất kho
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearAllFilters}
            className="secondary-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              color: 'var(--accent-rose)',
              borderColor: 'rgba(244, 63, 94, 0.3)',
            }}
          >
            <RotateCcw size={14} />
            <span>Xóa tất cả lọc</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          {/* Search by Name */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-dim)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              style={{
                width: '100%',
                padding: '10px 36px 10px 36px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent-sky)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Layers
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-dim)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={selectedCategory || ''}
              onChange={(e) => onSelectCategory(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: selectedCategory ? 'var(--accent-sky)' : 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Tất cả danh mục ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Tag
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-dim)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={selectedBrand || ''}
              onChange={(e) => onSelectBrand(e.target.value || null)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: selectedBrand ? 'var(--accent-sky)' : 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Tất cả thương hiệu ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <DollarSign
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-dim)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={priceRange}
              onChange={(e) => onPriceRangeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: priceRange !== 'all' ? 'var(--accent-sky)' : 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">Tất cả mức giá</option>
              <option value="under_10">Dưới 10.000.000₫</option>
              <option value="10_25">10.000.000₫ - 25.000.000₫</option>
              <option value="over_25">Trên 25.000.000₫</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ArrowUpDown
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                color: 'var(--text-dim)',
                pointerEvents: 'none',
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="name_asc">Tên: A → Z</option>
              <option value="name_desc">Tên: Z → A</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <SlidersHorizontal size={13} /> Đang lọc theo:
            </span>

            {searchQuery.trim() && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--accent-sky)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                }}
              >
                Từ khóa: &quot;{searchQuery.trim()}&quot;
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSearchChange('')}
                />
              </span>
            )}

            {currentCategoryObj && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(139, 92, 246, 0.12)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: 'var(--accent-purple)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                }}
              >
                Danh mục: {currentCategoryObj.name}
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectCategory(null)}
                />
              </span>
            )}

            {currentBrandObj && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: 'var(--accent-emerald)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                }}
              >
                Thương hiệu: {currentBrandObj.name}
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectBrand(null)}
                />
              </span>
            )}

            {priceRange !== 'all' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--accent-amber)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem',
                }}
              >
                Giá: {getPriceRangeLabel(priceRange)}
                <X
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPriceRangeChange('all')}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="glass-panel"
              style={{
                height: '380px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div className="skeleton" style={{ height: '180px', width: '100%' }} />
              <div className="skeleton" style={{ height: '20px', width: '60%' }} />
              <div className="skeleton" style={{ height: '30px', width: '90%' }} />
              <div className="skeleton" style={{ height: '24px', width: '40%', marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Không tìm thấy linh kiện phù hợp</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 20px' }}>
            Không có sản phẩm nào khớp với các bộ lọc bạn đã chọn. Hãy thử tìm từ khóa khác hoặc xóa bớt tiêu chí lọc.
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearAllFilters}
              className="primary-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} />
              <span>Xóa toàn bộ bộ lọc</span>
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            disabled={currentPage <= 0 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="secondary-btn"
            style={{
              opacity: currentPage <= 0 ? 0.5 : 1,
              cursor: currentPage <= 0 ? 'not-allowed' : 'pointer',
              padding: '8px 16px',
            }}
          >
            <ChevronLeft size={18} />
            <span>Trang trước</span>
          </button>

          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              fontWeight: 600,
              padding: '0 8px',
            }}
          >
            Trang <strong style={{ color: '#fff' }}>{currentPage + 1}</strong> / {totalPages}
          </div>

          <button
            disabled={currentPage >= totalPages - 1 || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="secondary-btn"
            style={{
              opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
              cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
              padding: '8px 16px',
            }}
          >
            <span>Trang sau</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
};
