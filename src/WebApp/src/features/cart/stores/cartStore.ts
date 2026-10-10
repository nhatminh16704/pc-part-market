import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';
import type { Product, ProductVariant } from '@/features/catalog/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant?: ProductVariant) => void;
  updateQuantity: (productId: string, variantId: string | undefined, delta: number) => void;
  removeItem: (productId: string, variantId: string | undefined) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product, variant) => {
        const targetVariant = variant || product.variants?.[0];
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.variant?.id === targetVariant?.id
          );

          if (existingIndex > -1) {
            const nextItems = [...state.items];
            nextItems[existingIndex] = {
              ...nextItems[existingIndex],
              quantity: nextItems[existingIndex].quantity + 1,
            };
            return { items: nextItems, isOpen: true };
          } else {
            return {
              items: [...state.items, { product, variant: targetVariant, quantity: 1 }],
              isOpen: true,
            };
          }
        });
      },

      updateQuantity: (productId, variantId, delta) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.product.id === productId && item.variant?.id === variantId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        }));
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.variant?.id === variantId)
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((sum, item) => {
          const price = item.variant?.price || 0;
          return sum + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'pc_part_market_cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
