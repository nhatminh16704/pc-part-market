import React from 'react';
import type { Brand } from '../types';

interface BrandBarProps {
  brands: Brand[];
  selectedBrand: string | null;
  onSelectBrand: (brandId: string | null) => void;
}

export const BrandBar: React.FC<BrandBarProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
}) => {
  return (
    <section style={{
      maxWidth: '1360px',
      margin: '40px auto 0',
      padding: '0 24px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.08em', fontWeight: 700 }}>
          Thương Hiệu Hàng Đầu
        </div>
        {selectedBrand && (
          <button
            onClick={() => onSelectBrand(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-sky)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Xóa lọc thương hiệu ✕
          </button>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {brands.slice(0, 15).map((b) => {
          const isSelected = selectedBrand === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBrand(isSelected ? null : b.id)}
              style={{
                background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: '1px solid',
                borderColor: isSelected ? 'var(--accent-sky)' : 'var(--border-subtle)',
                color: isSelected ? 'var(--accent-sky)' : 'var(--text-muted)',
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {b.name}
            </button>
          );
        })}
      </div>
    </section>
  );
};
