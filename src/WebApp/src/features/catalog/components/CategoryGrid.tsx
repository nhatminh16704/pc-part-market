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
      return <Cpu size={22} className="text-[#ff5636]" />;
    }
    if (s.includes('vga') || s.includes('card') || s.includes('do-hoa')) {
      return <MonitorPlay size={22} className="text-[#002023]" />;
    }
    if (s.includes('main') || s.includes('bo-mach')) {
      return <Layers size={22} className="text-blue-600" />;
    }
    if (s.includes('ram') || s.includes('bo-nho')) {
      return <Disc size={22} className="text-emerald-600" />;
    }
    if (s.includes('ssd') || s.includes('hdd') || s.includes('o-cung')) {
      return <Database size={22} className="text-amber-600" />;
    }
    if (s.includes('psu') || s.includes('nguon')) {
      return <BatteryCharging size={22} className="text-orange-500" />;
    }
    if (s.includes('cool') || s.includes('tan-nhiet')) {
      return <Fan size={22} className="text-teal-600" />;
    }
    if (s.includes('case') || s.includes('vo-may')) {
      return <Box size={22} className="text-indigo-600" />;
    }
    if (s.includes('man-hinh') || s.includes('monitor')) {
      return <MonitorPlay size={22} className="text-purple-600" />;
    }
    return <Cpu size={22} className="text-[#ff5636]" />;
  };

  return (
    <section className="container-custom mt-8 md:mt-10 min-w-0">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Danh Mục <span className="text-[#ff5636]">Linh Kiện</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Lựa chọn theo từng nhóm linh kiện để lắp ráp bộ máy tính tối ưu nhất
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
                  ? 'border-[#ff5636] bg-orange-50/80 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-[#ff5636]/50 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  isSelected ? 'bg-white shadow-sm border border-orange-200' : 'bg-slate-50'
                }`}
              >
                {getCategoryIcon(cat.name || cat.seoName || '')}
              </div>
              <div
                className={`font-semibold text-[11px] leading-tight line-clamp-2 ${
                  isSelected ? 'text-[#ff5636]' : 'text-slate-700'
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
