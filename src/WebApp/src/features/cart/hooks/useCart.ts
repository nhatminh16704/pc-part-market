import {
  useBasket,
  useAddToBasket,
  useUpdateBasketQuantity,
  useRemoveFromBasket,
  useClearBasket,
  useSyncBasket,
} from './useBasket';
import { useCartUIStore } from '../stores/cartUIStore';
import type { Product, ProductVariant } from '@/features/catalog/types';

export const useCart = () => {
  const { data: basket, isLoading, isError, refetch } = useBasket();
  const addMutation = useAddToBasket();
  const updateMutation = useUpdateBasketQuantity();
  const removeMutation = useRemoveFromBasket();
  const clearMutation = useClearBasket();
  const syncMutation = useSyncBasket();
  const { isOpen, openCart, closeCart, toggleCart } = useCartUIStore();

  const items = basket?.items ?? [];
  const totalCount = basket?.totalCount ?? 0;
  const totalAmount = basket?.totalAmount ?? 0;
  const hasPriceChanges = basket?.hasPriceChanges ?? false;

  const isPending =
    addMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending ||
    syncMutation.isPending;

  return {
    // Data
    items,
    totalCount,
    totalAmount,
    hasPriceChanges,
    isLoading: isLoading || isPending,
    isError,
    refetch,

    // Drawer UI
    isOpen,
    openCart,
    closeCart,
    toggleCart,

    // Actions
    addItem: async (product: Product, variant?: ProductVariant) => {
      const targetVariant = variant || product.variants?.[0];
      if (!targetVariant) return;
      openCart();
      return await addMutation.mutateAsync({
        productId: product.id,
        variantId: targetVariant.id,
        quantity: 1,
      });
    },

    updateQuantity: async (
      productId: string,
      variantId: string | undefined,
      delta: number
    ) => {
      if (!variantId) return;
      const current = items.find(
        (i) => i.productId === productId && i.variantId === variantId
      );
      if (!current) return;

      const newQty = current.quantity + delta;
      if (newQty > 0) {
        return await updateMutation.mutateAsync({
          productId,
          variantId,
          quantity: newQty,
        });
      } else {
        return await removeMutation.mutateAsync({ productId, variantId });
      }
    },

    removeItem: async (productId: string, variantId: string | undefined) => {
      if (!variantId) return;
      return await removeMutation.mutateAsync({ productId, variantId });
    },

    clearCart: async () => {
      return await clearMutation.mutateAsync();
    },

    syncCart: async (items: { productId: string; variantId: string; quantity: number }[]) => {
      return await syncMutation.mutateAsync({ items });
    },
  };
};
