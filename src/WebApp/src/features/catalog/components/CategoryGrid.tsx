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
        return <Cpu size={28} className="text-sky-400" />;
      case 'vga':
      case 'card-man-hinh':
        return <MonitorPlay size={28} className="text-purple-400" />;
      case 'mainboard':
      case 'bo-mach-chu':
        return <Layers size={28} className="text-cyan-400" />;
      case 'ram':
      case 'bo-nho-trong':
        return <Disc size={28} className="text-emerald-400" />;
      case 'storage':
      case 'ssd':
      case 'o-cung':
        return <Database size={28} className="text-amber-400" />;
      case 'psu':
      case 'nguon':
        return <BatteryCharging size={28} className="text-rose-400" />;
      case 'cooling':
      case 'tan-nhiet':
        return <Fan size={28} className="text-sky-400" />;
      default:
        return <Box size={28} className="text-sky-400" />;
    }
  };

  return (
    <section className="max-w-[1360px] mx-auto mt-10 px-6">
      <div className="flex justify-between items-end mb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Danh Mục <span className="gradient-text">Linh Kiện</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Lựa chọn theo từng nhóm linh kiện để lắp ráp bộ PC hoàn hảo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`glass-panel hover-lift p-4 text-center cursor-pointer flex flex-col items-center gap-3 rounded-2xl transition-all border ${
                isSelected
                  ? 'border-sky-400 bg-sky-500/15 shadow-md shadow-sky-500/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all ${
                  isSelected ? 'shadow-lg shadow-sky-500/30 border-sky-400' : ''
                }`}
              >
                {getCategoryIcon(cat.seoName || cat.name)}
              </div>
              <div
                className={`font-semibold text-xs leading-tight ${
                  isSelected ? 'text-sky-300 font-bold' : 'text-slate-200'
                }`}
              >
                {cat.name}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
