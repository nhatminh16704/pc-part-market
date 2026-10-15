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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white border border-slate-200 p-6 md:p-8 relative rounded-2xl shadow-2xl text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Images */}
          <div>
            <div className="h-72 md:h-80 bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-center overflow-hidden mb-3">
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
                    className={`w-16 h-16 rounded-lg border overflow-hidden shrink-0 transition-all cursor-pointer ${
                      selectedImage === img.imageUrl
                        ? 'border-[#ff5636] bg-orange-50/50 ring-2 ring-[#ff5636]/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
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
                <Badge variant="secondary" className="mb-2 bg-slate-100 text-slate-700 font-bold border-slate-200">
                  {product.brand.name}
                </Badge>
              )}
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h3>
            </div>

            {/* Price display */}
            <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80">
              <div className="text-2xl md:text-3xl font-extrabold text-[#ff5636] font-heading">
                {price > 0 ? formatVND(price) : 'Liên hệ báo giá'}
              </div>
              {selectedVariant?.warrantyMonths && (
                <div className="text-xs text-slate-600 mt-1">
                  Bảo hành chính hãng: <strong className="text-slate-900">{selectedVariant.warrantyMonths} tháng</strong>
                </div>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 1 && (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-2">
                  Phiên bản & Cấu hình:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Button
                      key={v.id}
                      variant={selectedVariant?.id === v.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedVariant(v)}
                      className={
                        selectedVariant?.id === v.id 
                          ? 'bg-[#ff5636] text-white font-bold' 
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }
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
                  <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-2">
                    Thông số nổi bật:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {entries.map(([key, val]) => (
                      <div key={key} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                        <span className="text-slate-500 block mb-0.5">{key}:</span>
                        <strong className="text-slate-900 font-semibold">{val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Description */}
            {product.description && (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Mô tả:
                </label>
                <p className="text-xs text-slate-600 leading-relaxed max-h-32 overflow-y-auto pr-1">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action Button */}
            <Button
              variant="default"
              size="lg"
              className="w-full mt-2 bg-[#ff5636] hover:bg-[#e63e1c] text-white font-bold shadow-md shadow-orange-500/20"
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
