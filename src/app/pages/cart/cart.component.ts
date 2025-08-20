import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartState, CartItem } from '../../models/cart.model';
import { AddToCart, RemoveFromCart, UpdateQuantity, ClearCart } from '../../store/cart/cart.actions';
import { CartStateClass } from '../../store/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  @Select(CartStateClass.getCartItems) cartItems$!: Observable<CartItem[]>;
  @Select(CartStateClass.getCartTotal) cartTotal$!: Observable<number>;
  @Select(CartStateClass.getItemCount) itemCount$!: Observable<number>;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private router: Router,
    private store: Store
  ) {}
  
  showMobileMenu: boolean = false;
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  itemCount: number = 0;
  promoCode: string = '';
  appliedDiscount: number = 0;
  shippingCost: number = 300;

  ngOnInit() {
    this.subscribeToCart();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToCart() {
    this.cartItems$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
    });

    this.cartTotal$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      this.cartTotal = total;
    });

    this.itemCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.itemCount = count;
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  }

  getTotalItems(): number {
    return this.itemCount;
  }

  goToCart(): void {
    // Уже находимся на странице корзины
    // Можно добавить логику для прокрутки к содержимому
  }

  increaseQuantity(index: number) {
    const item = this.cartItems[index];
    if (item && item.quantity < item.stock) {
      this.store.dispatch(new UpdateQuantity({ id: item.id, quantity: item.quantity + 1 }));
    }
  }

  decreaseQuantity(index: number) {
    const item = this.cartItems[index];
    if (item && item.quantity > 1) {
      this.store.dispatch(new UpdateQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  }

  removeItem(index: number) {
    const item = this.cartItems[index];
    if (item) {
      this.store.dispatch(new RemoveFromCart(item.id));
    }
  }

  clearCart() {
    this.store.dispatch(new ClearCart());
    this.appliedDiscount = 0;
    this.promoCode = '';
  }

  getSubtotal(): number {
    return this.cartTotal;
  }

  getShippingCost(): number {
    return this.cartItems.length > 0 ? this.shippingCost : 0;
  }

  getDiscount(): number {
    return this.appliedDiscount;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost() - this.getDiscount();
  }

  canCheckout(): boolean {
    return this.cartItems.length > 0 && this.cartItems.every(item => item.stock > 0);
  }

  applyPromoCode() {
    if (this.promoCode.trim() === '') return;

    // Имитация проверки промокода
    if (this.promoCode.toLowerCase() === 'sale10') {
      this.appliedDiscount = Math.round(this.getSubtotal() * 0.1);
      alert('Промокод применен! Скидка 10%');
    } else if (this.promoCode.toLowerCase() === 'free') {
      this.shippingCost = 0;
      alert('Промокод применен! Бесплатная доставка');
    } else {
      alert('Неверный промокод');
    }
  }

  proceedToCheckout() {
    if (!this.canCheckout()) {
      alert('Невозможно оформить заказ. Проверьте наличие товаров.');
      return;
    }
    
    // Переход на страницу оформления заказа
    this.router.navigate(['/checkout']);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.svg';
  }
}
