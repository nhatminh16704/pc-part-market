import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../types';
import { formatVND } from '../api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
}) => {
  const mainImage = product.images?.find((img) => img.isMain)?.imageUrl 
    || product.images?.[0]?.imageUrl
    || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';

  const firstVariant = product.variants?.[0];
  const price = firstVariant ? firstVariant.price : 0;
  const isAvailable = (firstVariant?.quantity ?? 0) > 0 || (product.variants?.length ?? 0) === 0;

  return (
    <div 
      className="glass-panel hover-lift flex flex-col justify-between rounded-2xl overflow-hidden relative cursor-pointer border border-white/10 hover:border-sky-400/30 transition-all duration-300"
      onClick={() => onQuickView(product)}
    >
      {/* Top Media Section */}
      <div className="relative bg-[#0a0e1a] p-4 h-52 flex items-center justify-center overflow-hidden">
        {/* Brand Tag */}
        {product.brand && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 bg-slate-900/80 border-white/10 text-sky-400 font-bold text-[11px] px-2 py-0.5 z-10"
          >
            {product.brand.name}
          </Badge>
        )}

        {/* Stock Status Badge */}
        <Badge
          variant={isAvailable ? 'emerald' : 'destructive'}
          className="absolute top-3 right-3 text-[10px] px-2 py-0.5 z-10"
        >
          {isAvailable ? 'Sẵn hàng' : 'Liên hệ'}
        </Badge>

        {/* Product Image */}
        <img
          src={mainImage}
          alt={product.name}
          loading="lazy"
          className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80';
          }}
        />
      </div>

      {/* Body Info Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category Chip */}
          <div className="text-[11px] text-slate-400 uppercase mb-1.5 font-semibold tracking-wider">
            {product.category?.name || 'Linh Kiện PC'}
          </div>

          {/* Product Title */}
          <h4 className="text-[15px] font-bold leading-snug mb-2.5 line-clamp-2 min-h-[2.8em] text-slate-100">
            {product.name}
          </h4>

          {/* Key Specs chips */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.entries(product.specifications).slice(0, 2).map(([key, val]) => (
                <span
                  key={key}
                  className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
                >
                  {key}: <strong className="text-white">{String(val)}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Price & Add To Cart */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div>
            <div className="text-lg font-extrabold text-sky-400 font-heading">
              {price > 0 ? formatVND(price) : 'Liên hệ báo giá'}
            </div>
            {firstVariant?.warrantyMonths && (
              <div className="text-[11px] text-slate-400">
                BH {firstVariant.warrantyMonths} tháng
              </div>
            )}
          </div>

          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              title="Xem chi tiết"
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              variant="glow"
              size="icon"
              className="h-9 w-9 rounded-lg p-0"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
