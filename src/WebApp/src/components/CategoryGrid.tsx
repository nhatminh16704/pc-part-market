import React from 'react';
import { Cpu, MonitorPlay, Layers, Disc, Database, BatteryCharging, Fan, Box } from 'lucide-react';
import type { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const getCategoryIcon = (seoName: string) => {
    switch (seoName.toLowerCase()) {
      case 'cpu':
        return <Cpu size={28} color="var(--accent-sky)" />;
      case 'vga':
      case 'card-man-hinh':
        return <MonitorPlay size={28} color="var(--accent-purple)" />;
      case 'mainboard':
      case 'bo-mach-chu':
        return <Layers size={28} color="var(--accent-cyan)" />;
      case 'ram':
      case 'bo-nho-trong':
        return <Disc size={28} color="var(--accent-emerald)" />;
      case 'storage':
      case 'ssd':
      case 'o-cung':
        return <Database size={28} color="var(--accent-amber)" />;
      case 'psu':
      case 'nguon':
        return <BatteryCharging size={28} color="var(--accent-rose)" />;
      case 'cooling':
      case 'tan-nhiet':
        return <Fan size={28} color="#38bdf8" />;
      default:
        return <Box size={28} color="var(--accent-sky)" />;
    }
  };

  return (
    <section style={{
      maxWidth: '1360px',
      margin: '40px auto 0',
      padding: '0 24px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '20px',
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Danh Mục <span className="gradient-text">Linh Kiện</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Lựa chọn theo từng nhóm linh kiện để lắp ráp bộ PC hoàn hảo
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '14px',
      }}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className="glass-panel hover-lift"
              style={{
                padding: '20px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                borderColor: isSelected ? 'var(--accent-sky)' : 'var(--border-subtle)',
                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSelected ? 'var(--glow-cyan)' : 'none',
                transition: 'all 0.25s ease',
              }}>
                {getCategoryIcon(cat.seoName || cat.name)}
              </div>
              <div>
                <div style={{
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.92rem',
                  color: isSelected ? 'var(--accent-sky)' : 'var(--text-main)',
                  lineHeight: 1.3,
                }}>
                  {cat.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
