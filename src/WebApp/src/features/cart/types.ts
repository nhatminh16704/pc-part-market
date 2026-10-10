import type { Product, ProductVariant } from '@/features/catalog/types';

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}
