import apiClient from '@/lib/axios';
import type {
  BasketResponse,
  AddBasketItemRequest,
  UpdateQuantityRequest,
  SyncBasketRequest,
} from '../types';

export const cartApi = {
  /**
   * Lấy giỏ hàng từ server (Redis)
   */
  getBasket: async (): Promise<BasketResponse> => {
    const res = await apiClient.get<BasketResponse>('/basket');
    return res.data;
  },

  /**
   * Thêm 1 sản phẩm/biến thể vào giỏ (giá tự động lấy từ Catalog)
   */
  addItem: async (data: AddBasketItemRequest): Promise<BasketResponse> => {
    const res = await apiClient.post<BasketResponse>('/basket/items', data);
    return res.data;
  },

  /**
   * Cập nhật số lượng của 1 biến thể
   */
  updateQuantity: async (
    productId: string,
    variantId: string,
    quantity: number
  ): Promise<BasketResponse> => {
    const payload: UpdateQuantityRequest = { quantity };
    const res = await apiClient.put<BasketResponse>(
      `/basket/items/${productId}/${variantId}`,
      payload
    );
    return res.data;
  },

  /**
   * Xóa 1 biến thể khỏi giỏ
   */
  removeItem: async (productId: string, variantId: string): Promise<BasketResponse> => {
    const res = await apiClient.delete<BasketResponse>(
      `/basket/items/${productId}/${variantId}`
    );
    return res.data;
  },

  /**
   * Xóa toàn bộ giỏ hàng
   */
  clearBasket: async (): Promise<void> => {
    await apiClient.delete('/basket');
  },

  /**
   * Đồng bộ / Merge toàn bộ giỏ hàng (khi login hoặc restore)
   */
  syncBasket: async (data: SyncBasketRequest): Promise<BasketResponse> => {
    const res = await apiClient.post<BasketResponse>('/basket', data);
    return res.data;
  },
};
