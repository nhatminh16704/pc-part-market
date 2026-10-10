import React from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../types';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface ProductSectionProps {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  totalCount,
  currentPage,
  pageSize,
  isLoading,
  onPageChange,
  onAddToCart,
  onQuickView,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <section id="products-section" style={{
      maxWidth: '1360px',
      margin: '48px auto 0',
      padding: '0 24px',
    }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Kho Linh Kiện <span className="gradient-text">Chính Hãng</span>
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tìm thấy <strong style={{ color: 'var(--accent-sky)' }}>{totalCount}</strong> sản phẩm sẵn sàng xuất kho
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
        }}>
          <SlidersHorizontal size={16} />
          <span>Sắp xếp: <strong>Mặc định</strong></span>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
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
        <div className="glass-panel" style={{
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Không tìm thấy linh kiện phù hợp</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px' }}>
            Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ các bộ lọc để xem toàn bộ danh mục sản phẩm.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        }}>
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
        <div style={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
        }}>
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

          <div style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            padding: '0 8px',
          }}>
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
