import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatVND } from '@/utils/format';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores';

export const CartDrawer: React.FC = () => {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalAmount = useCartStore((state) => state.getTotalAmount)();
  const totalCount = useCartStore((state) => state.getTotalCount)();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={closeCart}
    >
      <div 
        className="w-full max-w-md h-full bg-slate-950 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Giỏ Hàng Của Bạn</h3>
                <span className="text-xs text-slate-400">
                  {totalCount} linh kiện đã chọn
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="mt-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 flex flex-col gap-3">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-3 opacity-60">🛒</div>
                <div className="font-bold text-slate-300 text-sm mb-1">
                  Giỏ hàng chưa có linh kiện nào
                </div>
                <div className="text-xs text-slate-400">
                  Hãy dạo quanh gian hàng và chọn sản phẩm yêu thích nhé!
                </div>
              </div>
            ) : (
              items.map((item, idx) => {
                const img = item.product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80';
                const itemPrice = item.variant?.price ?? item.product.variants?.[0]?.price ?? 0;

                return (
                  <div
                    key={`${item.product.id}-${item.variant?.id || idx}`}
                    className="flex gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 items-center justify-between"
                  >
                    <div className="w-14 h-14 bg-slate-900 rounded-lg p-1 shrink-0 border border-white/5 flex items-center justify-center overflow-hidden">
                      <img src={img} alt="" className="max-w-full max-h-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-slate-200">
                        {item.product.name}
                      </h4>
                      {item.variant?.sku && (
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.variant.sku}
                        </div>
                      )}
                      <div className="text-xs font-extrabold text-sky-400 mt-0.5 font-heading">
                        {formatVND(itemPrice)}
                      </div>
                    </div>

                    {/* Quantity Modifier */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-white/10 bg-black/40 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.variant?.id, -1)}
                          className="px-2 py-0.5 text-xs text-slate-300 hover:bg-white/10 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-white min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.variant?.id, 1)}
                          className="px-2 py-0.5 text-xs text-slate-300 hover:bg-white/10 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product.id, item.variant?.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Checkout Summary */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
            <span>Tạm tính ({totalCount} món):</span>
            <span className="font-semibold text-slate-200">{formatVND(totalAmount)}</span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-slate-200">Tổng thanh toán:</span>
            <span className="text-xl font-extrabold text-sky-400 font-heading">
              {formatVND(totalAmount)}
            </span>
          </div>

          <div className="flex gap-2.5">
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-rose-400 hover:bg-rose-500/10 border-rose-500/20 text-xs"
              >
                Xóa tất cả
              </Button>
            )}

            <Button
              variant="glow"
              size="lg"
              disabled={items.length === 0}
              className="flex-1"
              onClick={() => {
                alert(`Đặt hàng thành công với tổng số tiền: ${formatVND(totalAmount)}!`);
                clearCart();
                closeCart();
              }}
            >
              <span>Tiến Hành Đặt Hàng</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
