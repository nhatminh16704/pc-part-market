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
  const getCategoryIcon = (rawText: string) => {
    const s = rawText.toLowerCase();
    if (s.includes('cpu') || s.includes('vi-xu-ly')) {
      return <Cpu size={24} className="text-sky-400" />;
    }
    if (s.includes('vga') || s.includes('card') || s.includes('do-hoa')) {
      return <MonitorPlay size={24} className="text-rose-400" />;
    }
    if (s.includes('main') || s.includes('bo-mach')) {
      return <Layers size={24} className="text-cyan-400" />;
    }
    if (s.includes('ram') || s.includes('bo-nho')) {
      return <Disc size={24} className="text-emerald-400" />;
    }
    if (s.includes('ssd') || s.includes('hdd') || s.includes('o-cung')) {
      return <Database size={24} className="text-amber-400" />;
    }
    if (s.includes('psu') || s.includes('nguon')) {
      return <BatteryCharging size={24} className="text-orange-400" />;
    }
    if (s.includes('cool') || s.includes('tan-nhiet')) {
      return <Fan size={24} className="text-teal-400" />;
    }
    if (s.includes('case') || s.includes('vo-may')) {
      return <Box size={24} className="text-indigo-400" />;
    }
    if (s.includes('man-hinh') || s.includes('monitor')) {
      return <MonitorPlay size={24} className="text-purple-400" />;
    }
    return <Cpu size={24} className="text-sky-400" />;
  };

  return (
    <section className="max-w-[1360px] mx-auto mt-10 px-4 sm:px-6 w-full min-w-0">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`p-3 text-center cursor-pointer flex flex-col items-center gap-2 rounded-xl transition-all border ${
                isSelected
                  ? 'border-sky-400 bg-sky-500/15 shadow-md shadow-sky-500/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all ${
                  isSelected ? 'shadow-md shadow-sky-500/30 border-sky-400 bg-sky-500/20' : ''
                }`}
              >
                {getCategoryIcon(cat.name || cat.seoName || '')}
              </div>
              <div
                className={`font-medium text-[11px] leading-tight line-clamp-2 ${
                  isSelected ? 'text-sky-300 font-bold' : 'text-slate-300'
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
