export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  description: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}
