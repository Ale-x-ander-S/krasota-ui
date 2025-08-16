export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_slug: string;
  quantity: number;
  description: string;
  stock: number;
  stock_type: string;
  sku: string;
  color: string;
  size: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}
