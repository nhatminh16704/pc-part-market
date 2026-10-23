import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import type {
  BasketResponse,
  AddBasketItemRequest,
  SyncBasketRequest,
} from '../types';

export const BASKET_QUERY_KEY = ['basket'];

/**
 * Hook truy vấn giỏ hàng hiện tại từ Redis qua Basket.API
 */
export const useBasket = () => {
  return useQuery<BasketResponse, Error>({
    queryKey: BASKET_QUERY_KEY,
    queryFn: () => cartApi.getBasket(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook thêm 1 linh kiện vào giỏ hàng
 */
export const useAddToBasket = () => {
  const queryClient = useQueryClient();

  return useMutation<BasketResponse, Error, AddBasketItemRequest>({
    mutationFn: (data: AddBasketItemRequest) => cartApi.addItem(data),
    onSuccess: (updatedBasket) => {
      queryClient.setQueryData(BASKET_QUERY_KEY, updatedBasket);
    },
    onError: (err) => {
      console.warn('[useAddToBasket] Failed to add item to basket:', err);
    },
  });
};

/**
 * Hook cập nhật số lượng của 1 linh kiện
 */
export const useUpdateBasketQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation<
    BasketResponse,
    Error,
    { productId: string; variantId: string; quantity: number }
  >({
    mutationFn: ({ productId, variantId, quantity }) =>
      cartApi.updateQuantity(productId, variantId, quantity),
    onSuccess: (updatedBasket) => {
      queryClient.setQueryData(BASKET_QUERY_KEY, updatedBasket);
    },
    onError: (err) => {
      console.warn('[useUpdateBasketQuantity] Failed to update quantity:', err);
    },
  });
};

/**
 * Hook xóa 1 linh kiện khỏi giỏ hàng
 */
export const useRemoveFromBasket = () => {
  const queryClient = useQueryClient();

  return useMutation<BasketResponse, Error, { productId: string; variantId: string }>({
    mutationFn: ({ productId, variantId }) =>
      cartApi.removeItem(productId, variantId),
    onSuccess: (updatedBasket) => {
      queryClient.setQueryData(BASKET_QUERY_KEY, updatedBasket);
    },
    onError: (err) => {
      console.warn('[useRemoveFromBasket] Failed to remove item:', err);
    },
  });
};

/**
 * Hook xóa toàn bộ giỏ hàng
 */
export const useClearBasket = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => cartApi.clearBasket(),
    onSuccess: () => {
      queryClient.setQueryData(BASKET_QUERY_KEY, {
        buyerId: '',
        items: [],
        totalCount: 0,
        totalAmount: 0,
        hasPriceChanges: false,
      });
    },
    onError: (err) => {
      console.warn('[useClearBasket] Failed to clear basket:', err);
    },
  });
};

/**
 * Hook đồng bộ / merge giỏ hàng
 */
export const useSyncBasket = () => {
  const queryClient = useQueryClient();

  return useMutation<BasketResponse, Error, SyncBasketRequest>({
    mutationFn: (data: SyncBasketRequest) => cartApi.syncBasket(data),
    onSuccess: (updatedBasket) => {
      queryClient.setQueryData(BASKET_QUERY_KEY, updatedBasket);
    },
    onError: (err) => {
      console.warn('[useSyncBasket] Failed to sync basket:', err);
    },
  });
};
