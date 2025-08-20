import { CartItem } from '../../models/cart.model';

export class AddToCart {
  static readonly type = '[Cart] Add Item';
  constructor(public payload: CartItem) {}
}

export class RemoveFromCart {
  static readonly type = '[Cart] Remove Item';
  constructor(public payload: number) {}
}

export class UpdateQuantity {
  static readonly type = '[Cart] Update Quantity';
  constructor(public payload: { id: number; quantity: number }) {}
}

export class ClearCart {
  static readonly type = '[Cart] Clear';
}
