import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { AddToCart, RemoveFromCart, UpdateQuantity, ClearCart } from './cart.actions';
import { CartState, CartItem } from '../../models/cart.model';

@State<CartState>({
  name: 'cart',
  defaults: {
    items: [],
    total: 0,
    itemCount: 0
  }
})
@Injectable()
export class CartStateClass {
  
  @Selector()
  static getCartItems(state: CartState) {
    return state.items;
  }
  
  @Selector()
  static getCartTotal(state: CartState) {
    return state.total;
  }
  
  @Selector()
  static getItemCount(state: CartState) {
    return state.itemCount;
  }

  @Action(AddToCart)
  addToCart(ctx: StateContext<CartState>, action: AddToCart) {
    const state = ctx.getState();
    const existingItem = state.items.find(item => item.id === action.payload.id);
    
    let newItems: CartItem[];
    
    if (existingItem) {
      newItems = state.items.map(item => 
        item.id === action.payload.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newItems = [...state.items, { ...action.payload, quantity: 1 }];
    }
    
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
    
    ctx.setState({
      items: newItems,
      total,
      itemCount
    });
  }

  @Action(RemoveFromCart)
  removeFromCart(ctx: StateContext<CartState>, action: RemoveFromCart) {
    const state = ctx.getState();
    const newItems = state.items.filter(item => item.id !== action.payload);
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
    
    ctx.setState({
      items: newItems,
      total,
      itemCount
    });
  }

  @Action(UpdateQuantity)
  updateQuantity(ctx: StateContext<CartState>, action: UpdateQuantity) {
    const state = ctx.getState();
    const newItems = state.items.map(item => 
      item.id === action.payload.id 
        ? { ...item, quantity: action.payload.quantity }
        : item
    ).filter(item => item.quantity > 0);
    
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
    
    ctx.setState({
      items: newItems,
      total,
      itemCount
    });
  }

  @Action(ClearCart)
  clearCart(ctx: StateContext<CartState>) {
    ctx.setState({
      items: [],
      total: 0,
      itemCount: 0
    });
  }
}
