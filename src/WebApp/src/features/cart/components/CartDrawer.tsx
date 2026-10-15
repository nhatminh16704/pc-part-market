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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={closeCart}
    >
      <div 
        className="w-full max-w-md h-full bg-white border-l border-slate-200 p-6 flex flex-col justify-between shadow-2xl text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-50 text-[#ff5636] border border-orange-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Giỏ Hàng Của Bạn</h3>
                <span className="text-xs text-slate-500">
                  {totalCount} linh kiện đã chọn
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Cart Items List */}
          <div className="mt-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 flex flex-col gap-3">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-3 opacity-60">🛒</div>
                <div className="font-bold text-slate-700 text-sm mb-1">
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
                    className="flex gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 items-center justify-between"
                  >
                    <div className="w-14 h-14 bg-white rounded-lg p-1 shrink-0 border border-slate-200 flex items-center justify-center overflow-hidden">
                      <img src={img} alt="" className="max-w-full max-h-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold truncate text-slate-900">
                        {item.product.name}
                      </h4>
                      {item.variant?.sku && (
                        <div className="text-[10px] text-slate-500 truncate">
                          {item.variant.sku}
                        </div>
                      )}
                      <div className="text-xs font-extrabold text-[#ff5636] mt-0.5 font-heading">
                        {formatVND(itemPrice)}
                      </div>
                    </div>

                    {/* Quantity Modifier */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.product.id, item.variant?.id, -1)}
                          className="h-7 w-7 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </Button>
                        <span className="px-2 text-xs font-bold text-slate-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.product.id, item.variant?.id, 1)}
                          className="h-7 w-7 text-xs text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id, item.variant?.id)}
                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Checkout Summary */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-1 text-xs text-slate-500">
            <span>Tạm tính ({totalCount} món):</span>
            <span className="font-semibold text-slate-800">{formatVND(totalAmount)}</span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-sm text-slate-900">Tổng thanh toán:</span>
            <span className="text-xl font-extrabold text-[#ff5636] font-heading">
              {formatVND(totalAmount)}
            </span>
          </div>

          <div className="flex gap-2.5">
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs"
              >
                Xóa tất cả
              </Button>
            )}

            <Button
              variant="default"
              size="lg"
              disabled={items.length === 0}
              className="flex-1 bg-[#ff5636] hover:bg-[#e63e1c] text-white font-bold shadow-md shadow-orange-500/20"
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
