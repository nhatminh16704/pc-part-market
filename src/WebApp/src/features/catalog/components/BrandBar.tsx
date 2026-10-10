import React from 'react';
import type { Brand } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase text-slate-400 tracking-wider font-bold">
          Thương Hiệu Hàng Đầu
        </div>
        {selectedBrand && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectBrand(null)}
            className="text-sky-400 text-xs h-7 hover:text-sky-300"
          >
            Xóa lọc thương hiệu <X className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none w-full min-w-0">
        {brands.slice(0, 15).map((b) => {
          const isSelected = selectedBrand === b.id;
          return (
            <Button
              key={b.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSelectBrand(isSelected ? null : b.id)}
              className={`rounded-full text-xs whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/25'
                  : 'text-slate-300 border-white/10 hover:border-white/20'
              }`}
            >
              {b.name}
              {isSelected && (
                <Badge variant="secondary" className="ml-1.5 px-1 py-0 text-[10px] bg-sky-950 text-sky-200">
                  ✓
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </section>
  );
};
