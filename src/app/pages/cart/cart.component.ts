import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_slug: string;
  quantity: number;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_slug: string;
  stock: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  constructor(private router: Router) {}
  
  showMobileMenu: boolean = false;
  cartItems: CartItem[] = [];
  promoCode: string = '';
  appliedDiscount: number = 0;
  shippingCost: number = 300;

  recommendedProducts: Product[] = [
    {
      id: 101,
      name: 'Беспроводные наушники Sony WH-1000XM4',
      price: 29999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Tb255IFdILTEwMDBYTTQ8L3RleHQ+PC9zdmc+',
      category_slug: 'Электроника',
      stock: 1
    },
    {
      id: 102,
      name: 'Умные часы Apple Watch Series 7',
      price: 39999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcHBsZSBXYXRjaCBTZXJpZXMgNzwvdGV4dD48L3N2Zz4=',
      category_slug: 'Электроника',
      stock: 1
    },
    {
      id: 103,
      name: 'Игровая консоль PlayStation 5',
      price: 59999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbGF5U3RhdGlvbiA1PC90ZXh0Pjwvc3ZnPg==',
      category_slug: 'Электроника',
      stock: 0
    }
  ];

  ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
    // Имитация загрузки товаров из корзины
    this.cartItems = [
      {
        id: 1,
        name: 'Смартфон iPhone 15 Pro',
        price: 129999,
        image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN0FGRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGhvbmUgMTUgUHJvPC90ZXh0Pjwvc3ZnPg==',
        category_slug: 'Электроника',
        quantity: 1,
        stock: 1
      },
      {
        id: 2,
        name: 'Ноутбук MacBook Air M2',
        price: 149999,
        image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWNCb29rIEFpcjwvdGV4dD48L3N2Zz4=',
        category_slug: 'Электроника',
        quantity: 1,
        stock: 1
      }
    ];
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  goToCart(): void {
    // Уже находимся на странице корзины
    // Можно добавить логику для прокрутки к содержимому
  }

  increaseQuantity(index: number) {
    this.cartItems[index].quantity++;
  }

  decreaseQuantity(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
    }
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
  }

  clearCart() {
    this.cartItems = [];
    this.appliedDiscount = 0;
    this.promoCode = '';
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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

  addToCart(product: Product) {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartItems.push({
        ...product,
        quantity: 1
      });
    }
    
    alert(`${product.name} добавлен в корзину`);
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
}
