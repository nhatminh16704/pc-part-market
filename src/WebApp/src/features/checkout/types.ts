export type CheckoutSource = 'BASKET' | 'BUY_NOW';

export type PaymentMethod = 'COD' | 'VNPAY' | 'MOMO' | 'BANK_TRANSFER';

export interface CheckoutItem {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  pictureUrl: string | null;
  unitPrice: number;
  quantity: number;
}

export interface CheckoutShippingAddress {
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  postalCode?: string | null;
}

export interface CheckoutSession {
  id: string;
  customerId: string;
  source: CheckoutSource;
  items: CheckoutItem[];
  shippingAddress: CheckoutShippingAddress | null;
  paymentMethod: PaymentMethod;
  voucherCode: string | null;
  note: string | null;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  expiresAt: string;
}

export interface CreateCheckoutSessionRequest {
  source: CheckoutSource;
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
}

export interface UpdateCheckoutSessionRequest {
  shippingAddress?: CheckoutShippingAddress;
  paymentMethod?: PaymentMethod;
  voucherCode?: string;
  note?: string;
}

export interface ConfirmCheckoutResponse {
  orderId: number;
  orderNumber: string;
}
