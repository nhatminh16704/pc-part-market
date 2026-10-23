import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';
import type { Product, ProductVariant } from '@/features/catalog/types';
import { cartApi } from '../api/cartApi';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  hasPriceChanges: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchBasket: () => Promise<void>;
  addItem: (product: Product, variant?: ProductVariant) => Promise<void>;
  updateQuantity: (productId: string, variantId: string | undefined, delta: number) => Promise<void>;
  removeItem: (productId: string, variantId: string | undefined) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalCount: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,
      hasPriceChanges: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      fetchBasket: async () => {
        try {
          set({ isLoading: true });
          const res = await cartApi.getBasket();

          if (res && res.items && res.items.length > 0) {
            const localItems = get().items;
            const merged: CartItem[] = res.items.map((serverItem) => {
              const local = localItems.find(
                (l) => l.product.id === serverItem.productId && l.variant?.id === serverItem.variantId
              );

              if (local) {
                return {
                  ...local,
                  quantity: serverItem.quantity,
                  unitPrice: serverItem.unitPrice,
                  oldUnitPrice: serverItem.oldUnitPrice,
                  isPriceChanged: serverItem.isPriceChanged,
                };
              }

              // Synthesize product shell if not present locally
              return {
                product: {
                  id: serverItem.productId,
                  name: serverItem.productName,
                  seoName: '',
                  description: '',
                  brandId: '',
                  categoryId: '',
                  specifications: {},
                  status: 'Active',
                  images: serverItem.pictureUrl
                    ? [
                        {
                          id: '',
                          imageUrl: serverItem.pictureUrl,
                          isMain: true,
                        },
                      ]
                    : [],
                  variants: [
                    {
                      id: serverItem.variantId,
                      productId: serverItem.productId,
                      price: serverItem.unitPrice,
                      quantity: 100,
                      sku: serverItem.sku,
                      model: serverItem.productName,
                      imageUrl: serverItem.pictureUrl || undefined,
                      warrantyMonths: 12,
                      status: 'Active',
                    },
                  ],
                },
                variant: {
                  id: serverItem.variantId,
                  productId: serverItem.productId,
                  price: serverItem.unitPrice,
                  quantity: 100,
                  sku: serverItem.sku,
                  model: serverItem.productName,
                  imageUrl: serverItem.pictureUrl || undefined,
                  warrantyMonths: 12,
                  status: 'Active',
                },
                quantity: serverItem.quantity,
                unitPrice: serverItem.unitPrice,
                oldUnitPrice: serverItem.oldUnitPrice,
                isPriceChanged: serverItem.isPriceChanged,
              };
            });

            set({
              items: merged,
              hasPriceChanges: res.hasPriceChanges,
              isLoading: false,
            });
          } else {
            // Server cart is empty, sync local cart if items exist
            const localItems = get().items;
            if (localItems.length > 0) {
              const syncItems = localItems
                .filter((i) => i.variant?.id)
                .map((i) => ({
                  productId: i.product.id,
                  variantId: i.variant!.id,
                  quantity: i.quantity,
                }));

              if (syncItems.length > 0) {
                await cartApi.syncBasket({ items: syncItems });
              }
            }
            set({ isLoading: false });
          }
        } catch (err) {
          console.warn('[CartStore] Failed to fetch basket from server:', err);
          set({ isLoading: false });
        }
      },

      addItem: async (product, variant) => {
        const targetVariant = variant || product.variants?.[0];

        // 1. Optimistic Local Update
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
              items: [
                ...state.items,
                {
                  product,
                  variant: targetVariant,
                  quantity: 1,
                  unitPrice: targetVariant?.price,
                  oldUnitPrice: targetVariant?.price,
                  isPriceChanged: false,
                },
              ],
              isOpen: true,
            };
          }
        });

        // 2. Background Sync to Basket.API
        if (targetVariant?.id) {
          try {
            const res = await cartApi.addItem({
              productId: product.id,
              variantId: targetVariant.id,
              quantity: 1,
            });

            const serverItem = res.items.find(
              (i) => i.productId === product.id && i.variantId === targetVariant.id
            );

            if (serverItem) {
              set((state) => ({
                items: state.items.map((item) => {
                  if (item.product.id === product.id && item.variant?.id === targetVariant.id) {
                    return {
                      ...item,
                      unitPrice: serverItem.unitPrice,
                      oldUnitPrice: serverItem.oldUnitPrice,
                      isPriceChanged: serverItem.isPriceChanged,
                    };
                  }
                  return item;
                }),
                hasPriceChanges: res.hasPriceChanges,
              }));
            }
          } catch (err) {
            console.warn('[CartStore] Failed to sync addItem to Basket.API:', err);
          }
        }
      },

      updateQuantity: async (productId, variantId, delta) => {
        const currentItem = get().items.find(
          (i) => i.product.id === productId && i.variant?.id === variantId
        );
        if (!currentItem) return;

        const newQty = currentItem.quantity + delta;

        // 1. Optimistic Local Update
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.product.id === productId && item.variant?.id === variantId) {
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        }));

        // 2. Background Sync to Basket.API
        if (variantId) {
          try {
            if (newQty > 0) {
              await cartApi.updateQuantity(productId, variantId, newQty);
            } else {
              await cartApi.removeItem(productId, variantId);
            }
          } catch (err) {
            console.warn('[CartStore] Failed to sync quantity to Basket.API:', err);
          }
        }
      },

      removeItem: async (productId, variantId) => {
        // 1. Optimistic Local Update
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.variant?.id === variantId)
          ),
        }));

        // 2. Background Sync to Basket.API
        if (variantId) {
          try {
            await cartApi.removeItem(productId, variantId);
          } catch (err) {
            console.warn('[CartStore] Failed to remove item from Basket.API:', err);
          }
        }
      },

      clearCart: async () => {
        set({ items: [], hasPriceChanges: false });
        try {
          await cartApi.clearBasket();
        } catch (err) {
          console.warn('[CartStore] Failed to clear basket on server:', err);
        }
      },

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((sum, item) => {
          const price = item.unitPrice ?? item.variant?.price ?? 0;
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
