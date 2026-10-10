import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useProductBySeo } from '@/features/catalog/hooks/useCatalog';
import { formatVND } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { parseSpecifications } from '@/utils/specs';
import { useCartStore } from '@/stores';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, Wrench } from 'lucide-react';
import type { ProductVariant } from '@/features/catalog/types';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isGuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const { data: productById, isLoading: loadingId } = useProduct(isGuid ? id : undefined);
  const { data: productBySeo, isLoading: loadingSeo } = useProductBySeo(!isGuid ? id : undefined);

  const product = productById || productBySeo;
  const isLoading = loadingId || loadingSeo;

  const addItem = useCartStore((state) => state.addItem);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-[1360px] mx-auto px-6 py-16">
        <div className="glass-panel p-8 flex flex-col md:flex-row gap-8 rounded-2xl">
          <div className="skeleton h-96 w-full md:w-1/2" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="skeleton h-8 w-1/3" />
            <div className="skeleton h-12 w-4/5" />
            <div className="skeleton h-16 w-1/2" />
            <div className="skeleton h-32 w-full mt-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1360px] mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy linh kiện</h2>
        <p className="text-slate-400 mb-6">Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.</p>
        <Link to="/">
          <Button variant="glow">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Quay lại trang chủ</span>
          </Button>
        </Link>
      </div>
    );
  }

  const currentVariant = selectedVariant || product.variants?.[0];
  const currentImage = selectedImage || product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80';
  const price = currentVariant?.price ?? 0;

  return (
    <div className="max-w-[1360px] mx-auto px-6 py-10">
      <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Quay lại danh mục</span>
      </Link>

      <div className="glass-panel p-6 md:p-10 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Product Images */}
        <div>
          <div className="h-80 md:h-96 bg-[#0a0e1a] rounded-xl border border-white/10 p-6 flex items-center justify-center overflow-hidden mb-4">
            <img src={currentImage} alt={product.name} className="max-w-full max-h-full object-contain" />
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-16 h-16 rounded-xl border p-1 overflow-hidden transition-all ${
                    currentImage === img.imageUrl ? 'border-sky-400 bg-sky-500/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase */}
        <div className="flex flex-col gap-5">
          <div>
            {product.brand && (
              <Badge variant="sky" className="mb-2">
                {product.brand.name}
              </Badge>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
              {product.name}
            </h1>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-3xl font-extrabold text-sky-400 font-heading">
              {price > 0 ? formatVND(price) : 'Liên hệ báo giá'}
            </div>
            {currentVariant?.warrantyMonths && (
              <div className="text-xs text-slate-400 mt-1">
                Bảo hành chính hãng: <strong className="text-white">{currentVariant.warrantyMonths} tháng</strong>
              </div>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2">
                Chọn phiên bản cấu hình:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <Button
                    key={v.id}
                    variant={currentVariant?.id === v.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedVariant(v)}
                    className={currentVariant?.id === v.id ? 'border-sky-400 bg-sky-500/20 text-sky-300' : 'text-slate-300'}
                  >
                    {v.sku || v.model || formatVND(v.price)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Specs */}
          {(() => {
            const specs = parseSpecifications(product.specifications);
            const entries = Object.entries(specs);
            if (entries.length === 0) return null;
            return (
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-2">
                  Thông số kỹ thuật:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {entries.map(([key, val]) => (
                    <div key={key} className="bg-white/5 rounded-lg p-2.5 border border-white/5">
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
                Mô tả sản phẩm:
              </label>
              <p className="text-xs text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Add to Cart CTA */}
          <Button
            variant="glow"
            size="lg"
            className="w-full mt-2"
            onClick={() => addItem(product, currentVariant)}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            <span>Thêm vào giỏ hàng</span>
          </Button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Chính hãng 100%</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Giao hàng 2H</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wrench className="w-4 h-4 text-purple-400" />
              <span>Hỗ trợ lắp ráp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
