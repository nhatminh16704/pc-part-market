import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import type { Product, ProductVariant } from '../types';
import { formatVND } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { parseSpecifications } from '@/utils/specs';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
}) => {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product?.variants?.[0]
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    product?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'
  );

  if (!product) return null;

  const price = selectedVariant?.price ?? (product.variants?.[0]?.price || 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-white/15 p-6 md:p-8 relative rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Images */}
          <div>
            <div className="h-72 md:h-80 bg-[#0a0e1a] rounded-xl border border-white/10 p-4 flex items-center justify-center overflow-hidden mb-3">
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Thumbnail Carousel */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`w-16 h-16 rounded-lg border overflow-hidden shrink-0 transition-colors ${
                      selectedImage === img.imageUrl
                        ? 'border-sky-400 bg-sky-500/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col gap-4">
            <div>
              {product.brand && (
                <Badge variant="sky" className="mb-2">
                  {product.brand.name}
                </Badge>
              )}
              <h3 className="text-xl md:text-2xl font-bold text-white leading-snug">
                {product.name}
              </h3>
            </div>

            {/* Price display */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl md:text-3xl font-extrabold text-sky-400 font-heading">
                {price > 0 ? formatVND(price) : 'Liên hệ báo giá'}
              </div>
              {selectedVariant?.warrantyMonths && (
                <div className="text-xs text-slate-400 mt-1">
                  Bảo hành chính hãng: <strong>{selectedVariant.warrantyMonths} tháng</strong>
                </div>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 1 && (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2">
                  Phiên bản & Cấu hình:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Button
                      key={v.id}
                      variant={selectedVariant?.id === v.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedVariant(v)}
                      className={selectedVariant?.id === v.id ? 'border-sky-400 bg-sky-500/20 text-sky-300' : 'text-slate-300'}
                    >
                      {v.sku || v.model || formatVND(v.price)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications */}
            {(() => {
              const specs = parseSpecifications(product.specifications);
              const entries = Object.entries(specs);
              if (entries.length === 0) return null;
              return (
                <div>
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2">
                    Thông số nổi bật:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {entries.map(([key, val]) => (
                      <div key={key} className="bg-white/5 rounded-lg p-2 border border-white/5">
                        <span className="text-slate-400 block">{key}:</span>
                        <strong className="text-white">{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Description */}
            {product.description && (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Mô tả:
                </label>
                <p className="text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-1">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action Button */}
            <Button
              variant="glow"
              size="lg"
              className="w-full mt-2"
              onClick={() => {
                addItem(product, selectedVariant);
                onClose();
              }}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span>Thêm vào giỏ hàng ngay</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
