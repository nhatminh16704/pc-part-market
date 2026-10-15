import React from 'react';
import type { Brand } from '../types';
import { X } from 'lucide-react';

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
    <section className="container-custom mt-8 md:mt-10 min-w-0">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase text-slate-500 tracking-wider font-bold">
            Thương Hiệu Hàng Đầu
          </div>
          {selectedBrand && (
            <button
              type="button"
              onClick={() => onSelectBrand(null)}
              className="text-[#ff5636] text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Xóa lọc thương hiệu <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none w-full min-w-0">
          {brands.slice(0, 15).map((b) => {
            const isSelected = selectedBrand === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBrand(isSelected ? null : b.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#ff5636] text-white border-[#ff5636] font-bold shadow-sm shadow-orange-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#ff5636]/40 hover:bg-orange-50/50'
                }`}
              >
                {b.name}
                {isSelected && (
                  <span className="ml-1.5 text-[10px]">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
