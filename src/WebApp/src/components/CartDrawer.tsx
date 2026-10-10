import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import type { CartItem } from '../types';
import { formatVND } from '../api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string | undefined) => void;
  onClearCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => {
    const price = item.variant?.price ?? item.product.variants?.[0]?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#0c101c',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={22} color="var(--accent-sky)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Giỏ Hàng ({cartItems.reduce((sum, i) => sum + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Cart Item List */}
          <div style={{
            marginTop: '20px',
            maxHeight: 'calc(100vh - 280px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <ShoppingBag size={48} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
                <p>Giỏ hàng của bạn đang trống</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const imgUrl = item.product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';
                const price = item.variant?.price ?? item.product.variants?.[0]?.price ?? 0;

                return (
                  <div 
                    key={`${item.product.id}-${item.variant?.id}`}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <img 
                      src={imgUrl} 
                      alt={item.product.name} 
                      style={{
                        width: '64px',
                        height: '64px',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        backgroundColor: '#070a12',
                      }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '4px' }}>
                        {item.product.name}
                      </div>
                      {item.variant && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                          SKU: {item.variant.sku}
                        </div>
                      )}
                      <div style={{ color: 'var(--accent-sky)', fontWeight: 700, fontSize: '0.9rem' }}>
                        {formatVND(price)}
                      </div>

                      {/* Quantity row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                        }}>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.variant?.id, -1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.variant?.id, 1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id, item.variant?.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-rose)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div style={{
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
              fontSize: '1.1rem',
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
              <strong style={{ color: 'var(--accent-sky)', fontSize: '1.3rem' }}>
                {formatVND(totalAmount)}
              </strong>
            </div>

            <button
              className="glow-btn"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                borderRadius: 'var(--radius-md)',
              }}
              onClick={() => alert(`Đặt hàng thành công tổng cộng: ${formatVND(totalAmount)}! Chúc mừng bạn!`)}
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
