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
    <section className="max-w-[1360px] mx-auto mt-10 px-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase text-slate-400 tracking-wider font-bold">
          Thương Hiệu Hàng Đầu
        </div>
        {selectedBrand && (
          <button
            onClick={() => onSelectBrand(null)}
            className="bg-transparent border-0 text-sky-400 text-xs font-semibold cursor-pointer hover:underline"
          >
            Xóa lọc thương hiệu ✕
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {brands.slice(0, 15).map((b) => {
          const isSelected = selectedBrand === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onSelectBrand(isSelected ? null : b.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold shadow-sm shadow-sky-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
              }`}
            >
              {b.name}
            </button>
          );
        })}
      </div>
    </section>
  );
};
