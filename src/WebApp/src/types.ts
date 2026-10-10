export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  isMain: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  price: number;
  quantity: number;
  sku: string;
  model?: string;
  imageUrl?: string;
  description?: string;
  warrantyMonths: number;
  barcode?: string;
  status: string;
}

export interface Brand {
  id: string;
  name: string;
  seoName: string;
  description?: string;
  imageUrl?: string;
  status: string;
}

export interface Category {
  id: string;
  name: string;
  seoName: string;
  description?: string;
  parentId?: string;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  seoName: string;
  brandId?: string;
  brand?: Brand;
  categoryId: string;
  category?: Category;
  specifications?: Record<string, string | number | boolean>;
  description?: string;
  status: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface PaginatedItems<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}
