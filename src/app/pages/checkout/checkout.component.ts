import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  inStock: boolean;
}

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryMethod: string;
  paymentMethod: string;
  notes: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  showMobileMenu: boolean = false;
  cartItems: CartItem[] = [];
  checkoutForm: CheckoutForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryMethod: 'courier',
    paymentMethod: 'card',
    notes: ''
  };

  deliveryMethods = [
    { value: 'courier', label: 'Курьерская доставка', price: 300, time: '1-2 дня' },
    { value: 'pickup', label: 'Самовывоз', price: 0, time: 'В день заказа' },
    { value: 'post', label: 'Почта России', price: 150, time: '5-10 дней' }
  ];

  paymentMethods = [
    { value: 'card', label: 'Банковская карта', icon: '💳' },
    { value: 'cash', label: 'Наличными при получении', icon: '💵' },
    { value: 'online', label: 'Онлайн оплата', icon: '🌐' }
  ];

  selectedDelivery = this.deliveryMethods[0];
  selectedPayment = this.paymentMethods[0];

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
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN0FGRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGhvbmUgMTUgUHJvPC90ZXh0Pjwvc3ZnPg==',
        category: 'Электроника',
        quantity: 1,
        inStock: true
      },
      {
        id: 2,
        name: 'Ноутбук MacBook Air M2',
        price: 149999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWNCb29rIEFpcjwvdGV4dD48L3N2Zz4=',
        category: 'Электроника',
        quantity: 1,
        inStock: true
      }
    ];
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getDeliveryCost(): number {
    return this.selectedDelivery.price;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getDeliveryCost();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  }

  onDeliveryChange(method: any) {
    this.selectedDelivery = method;
  }

  onPaymentChange(method: any) {
    this.selectedPayment = method;
  }

  onSubmit() {
    if (this.validateForm()) {
      // Здесь будет логика отправки заказа
      console.log('Заказ оформлен:', {
        items: this.cartItems,
        form: this.checkoutForm,
        delivery: this.selectedDelivery,
        payment: this.selectedPayment,
        total: this.getTotal()
      });
      
      // Перенаправление на страницу успешного заказа
      // this.router.navigate(['/order-success']);
    }
  }

  validateForm(): boolean {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode'];
    return requiredFields.every(field => this.checkoutForm[field as keyof CheckoutForm]?.trim() !== '');
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }
}
