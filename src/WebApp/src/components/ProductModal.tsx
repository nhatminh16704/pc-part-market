import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import type { Product, ProductVariant } from '../types';
import { formatVND } from '../api';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'
  );

  const price = selectedVariant?.price ?? (product.variants?.[0]?.price || 0);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div 
        className="glass-panel"
        style={{
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0d121f',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '32px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
        }}>
          {/* Images Section */}
          <div>
            <div style={{
              height: '320px',
              backgroundColor: '#070a12',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid var(--border-subtle)',
            }}>
              <img
                src={selectedImage}
                alt={product.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>

            {/* Thumbnail Carousel */}
            {product.images && product.images.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}>
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: selectedImage === img.imageUrl ? 'var(--accent-sky)' : 'transparent',
                      background: '#070a12',
                      padding: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <img src={img.imageUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                marginBottom: '10px',
              }}>
                {product.brand && (
                  <span style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    color: 'var(--accent-sky)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}>
                    {product.brand.name}
                  </span>
                )}
                {product.category && (
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                  }}>
                    {product.category.name}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.45rem', lineHeight: 1.3, marginBottom: '14px' }}>
                {product.name}
              </h2>

              <div style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'var(--accent-sky)',
                fontFamily: 'var(--font-heading)',
                marginBottom: '16px',
              }}>
                {price > 0 ? formatVND(price) : 'Liên hệ'}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 1 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                    Phiên bản / Biến thể:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          background: selectedVariant?.id === v.id ? 'var(--accent-sky)' : 'rgba(255, 255, 255, 0.05)',
                          color: selectedVariant?.id === v.id ? '#090d16' : 'var(--text-main)',
                          border: '1px solid',
                          borderColor: selectedVariant?.id === v.id ? 'var(--accent-sky)' : 'var(--border-subtle)',
                          cursor: 'pointer',
                          fontWeight: selectedVariant?.id === v.id ? 700 : 500,
                        }}
                      >
                        {v.sku || v.model || formatVND(v.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs Grid */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                    Thông số kỹ thuật chính:
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} style={{ fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-dim)' }}>{key}: </span>
                        <strong style={{ color: 'var(--text-main)' }}>{String(val)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                }}>
                  {product.description}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <button
                onClick={() => {
                  onAddToCart(product, selectedVariant);
                  onClose();
                }}
                className="glow-btn"
                style={{ flex: 1, padding: '14px', fontSize: '1rem' }}
              >
                <ShoppingCart size={20} />
                <span>Thêm Vào Giỏ Hàng</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
