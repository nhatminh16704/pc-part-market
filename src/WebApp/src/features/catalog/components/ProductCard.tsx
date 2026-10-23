import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../types';
import { formatVND } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/features/cart/hooks/useCart';
import { parseSpecifications } from '@/utils/specs';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
}) => {
  const { addItem } = useCart();

  const mainImage = product.images?.find((img) => img.isMain)?.imageUrl 
    || product.images?.[0]?.imageUrl
    || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';

  const firstVariant = product.variants?.[0];
  const price = firstVariant ? firstVariant.price : 0;
  const isAvailable = (firstVariant?.quantity ?? 0) > 0 || (product.variants?.length ?? 0) === 0;

  return (
    <div 
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden relative cursor-pointer hover:border-[#ff5636]/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
      onClick={() => onQuickView(product)}
    >
      {/* Top Media Section */}
      <div className="relative bg-slate-50/80 p-4 h-52 flex items-center justify-center overflow-hidden border-b border-slate-100">
        {/* Brand Tag */}
        {product.brand && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-white/90 border-slate-200 text-slate-800 font-bold text-[11px] px-2 py-0.5 z-10 shadow-xs"
          >
            {product.brand.name}
          </Badge>
        )}

        {/* Stock Status Badge */}
        <Badge
          variant={isAvailable ? 'emerald' : 'destructive'}
          className="absolute top-3 right-3 text-[10px] px-2 py-0.5 z-10 font-medium"
        >
          {isAvailable ? 'Sẵn hàng' : 'Liên hệ'}
        </Badge>

        {/* Product Image */}
        <img
          src={mainImage}
          alt={product.name}
          loading="lazy"
          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>

      {/* Body Info Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category Chip */}
          <div className="text-[11px] text-slate-500 uppercase mb-1.5 font-bold tracking-wider">
            {product.category?.name || 'Linh Kiện PC'}
          </div>

          {/* Product Title */}
          <h4 className="text-[14px] font-bold leading-snug mb-2.5 line-clamp-2 min-h-[2.8em] text-slate-900 group-hover:text-[#ff5636] transition-colors">
            {product.name}
          </h4>

          {/* Key Specs chips */}
          {(() => {
            const specs = parseSpecifications(product.specifications);
            const entries = Object.entries(specs);
            if (entries.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-1 mb-3">
                {entries.slice(0, 2).map(([key, val]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="bg-slate-50 border-slate-200 text-[10px] font-normal px-1.5 py-0.5 rounded text-slate-600"
                  >
                    <span className="text-slate-400 mr-1">{key}:</span>
                    <strong className="text-slate-800 font-semibold">{val}</strong>
                  </Badge>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Footer: Price & Add To Cart */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-extrabold text-[#ff5636] font-heading">
              {price > 0 ? formatVND(price) : 'Liên hệ báo giá'}
            </div>
            {firstVariant?.warrantyMonths && (
              <div className="text-[11px] text-slate-500">
                BH {firstVariant.warrantyMonths} tháng
              </div>
            )}
          </div>

          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              title="Xem chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-lg p-0 bg-[#ff5636] hover:bg-[#e63e1c] text-white shadow-xs"
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
