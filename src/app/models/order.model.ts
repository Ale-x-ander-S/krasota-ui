export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  // Дополнительные поля для отображения (заполняются на фронтенде)
  product_name?: string;
  product_image?: string;
  image_url?: string;
  image?: string;
}

export interface Order {
  id: number;
  user_id?: number;
  is_anonymous?: boolean;
  guest_email?: string;
  guest_phone?: string;
  guest_name?: string;
  status: OrderStatus;
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  shipping_address: string;
  billing_address: string;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  items: {
    product_id: number;
    quantity: number;
  }[];
  billing_address: string;
  shipping_address: string;
  payment_method: PaymentMethod;
  notes?: string;
  coupon_code?: string;
  guest_email?: string;
  guest_name?: string;
  guest_phone?: string;
}

export interface CreateGuestOrderRequest {
  items: {
    product_id: number;
    quantity: number;
  }[];
  billing_address: string;
  shipping_address: string;
  payment_method: PaymentMethod;
  notes?: string;
  coupon_code?: string;
  guest_email: string;
  guest_name: string;
  guest_phone: string;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  notes?: string;
  shipping_address?: string;
  billing_address?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CARD = 'card',
  CASH = 'cash',
  ONLINE = 'online'
}

export interface OrderFilters {
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}
