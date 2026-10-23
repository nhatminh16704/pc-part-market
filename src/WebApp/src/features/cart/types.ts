import type { Product, ProductVariant } from '@/features/catalog/types';

export interface ServerBasketItem {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  pictureUrl: string | null;
  unitPrice: number;
  oldUnitPrice: number;
  quantity: number;
  lineTotal: number;
  isPriceChanged: boolean;
}

export interface BasketResponse {
  buyerId: string;
  items: ServerBasketItem[];
  totalCount: number;
  totalAmount: number;
  hasPriceChanges: boolean;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice?: number;
  oldUnitPrice?: number;
  isPriceChanged?: boolean;
}

export interface AddBasketItemRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export interface SyncBasketItemRequest {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface SyncBasketRequest {
  items: SyncBasketItemRequest[];
}
