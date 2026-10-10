import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../types';
import { formatVND } from '../api';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const mainImage = product.images?.find((img) => img.isMain)?.imageUrl 
    || product.images?.[0]?.imageUrl
    || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';

  const firstVariant = product.variants?.[0];
  const price = firstVariant ? firstVariant.price : 0;
  const isAvailable = (firstVariant?.quantity ?? 0) > 0 || (product.variants?.length ?? 0) === 0;

  return (
    <div 
      className="glass-panel hover-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={() => onQuickView(product)}
    >
      {/* Top Media Section */}
      <div style={{
        position: 'relative',
        backgroundColor: '#0a0e1a',
        padding: '16px',
        height: '210px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Brand Tag */}
        {product.brand && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--accent-sky)',
            zIndex: 2,
          }}>
            {product.brand.name}
          </div>
        )}

        {/* Stock Status Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
          border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          borderRadius: '999px',
          padding: '2px 8px',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: isAvailable ? 'var(--accent-emerald)' : 'var(--accent-rose)',
          zIndex: 2,
        }}>
          {isAvailable ? 'Sẵn hàng' : 'Liên hệ'}
        </div>

        {/* Product Image */}
        <img
          src={mainImage}
          alt={product.name}
          loading="lazy"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>

      {/* Body Info Section */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
      }}>
        <div>
          {/* Category Chip */}
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            marginBottom: '6px',
            fontWeight: 600,
          }}>
            {product.category?.name || 'Linh Kiện PC'}
          </div>

          {/* Product Title */}
          <h4 style={{
            fontSize: '0.98rem',
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: '10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.8em',
          }}>
            {product.name}
          </h4>

          {/* Key Specs chips */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginBottom: '12px',
            }}>
              {Object.entries(product.specifications).slice(0, 2).map(([key, val]) => (
                <span
                  key={key}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {key}: <strong style={{ color: '#fff' }}>{String(val)}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Price & Add To Cart */}
        <div style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--accent-sky)',
              fontFamily: 'var(--font-heading)',
            }}>
              {price > 0 ? formatVND(price) : 'Liên hệ báo giá'}
            </div>
            {firstVariant?.warrantyMonths && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                BH {firstVariant.warrantyMonths} tháng
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              title="Xem chi tiết"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <Eye size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              title="Thêm vào giỏ hàng"
              className="glow-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                padding: 0,
              }}
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
