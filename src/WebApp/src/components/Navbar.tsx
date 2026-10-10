import React from 'react';
import { Cpu, Search, ShoppingCart, User, Layers, Sparkles } from 'lucide-react';
import type { Category } from '../types';

interface NavbarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(7, 10, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      {/* Top Banner Notice */}
      <div style={{
        background: 'linear-gradient(90deg, #0284c7 0%, #6366f1 50%, #8b5cf6 100%)',
        padding: '6px 16px',
        fontSize: '0.8rem',
        fontWeight: 600,
        textAlign: 'center',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}>
        <Sparkles size={14} />
        <span>SỰ KIỆN BUILD PC ĐỈNH CAO - GIẢM ĐẾN 25% CHO COMBO CPU + VGA THÁNG NÀY!</span>
      </div>

      {/* Main Nav Container */}
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectCategory(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-cyan)',
          }}>
            <Cpu size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              PC PART <span className="gradient-text">MARKET</span>
            </div>
            <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Sàn Linh Kiện Cao Cấp
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          flex: 1,
          maxWidth: '560px',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 6px 4px 18px',
            transition: 'all 0.25s ease',
          }}>
            <Search size={18} color="var(--text-dim)" style={{ marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Tìm kiếm CPU, RTX 4090, Mainboard, RAM DDR5..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="secondary-btn"
            style={{
              position: 'relative',
              padding: '10px 16px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <ShoppingCart size={20} color="var(--accent-sky)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Giỏ hàng</span>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: '999px',
                padding: '2px 7px',
                boxShadow: '0 2px 8px rgba(244, 63, 94, 0.5)',
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Button */}
          <button
            className="glow-btn"
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
            }}
          >
            <User size={18} />
            <span>Tài khoản</span>
          </button>
        </div>
      </div>

      {/* Category Sub-navigation Pills */}
      <div style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '6px 24px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => onSelectCategory(null)}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: selectedCategory === null ? 700 : 500,
            background: selectedCategory === null ? 'var(--accent-sky)' : 'rgba(255, 255, 255, 0.05)',
            color: selectedCategory === null ? '#090d16' : 'var(--text-muted)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Layers size={14} />
          <span>Tất cả linh kiện</span>
        </button>

        {categories.slice(0, 8).map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'var(--accent-sky)' : 'rgba(255, 255, 255, 0.04)',
                color: isActive ? '#090d16' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-sky)' : 'transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </header>
  );
};
