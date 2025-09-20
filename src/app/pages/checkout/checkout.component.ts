import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CreateOrderRequest, CreateGuestOrderRequest, Order } from '../../models/order.model';
import { CartItem } from '../../models/cart.model';
import { CartStateClass } from '../../store/cart/cart.state';
import { ClearCart } from '../../store/cart/cart.actions';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  deliveryMethod: string;
  paymentMethod: string;
  notes: string;
  couponCode: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  showMobileMenu: boolean = false;
  loading = false;
  error: string | null = null;
  showSuccessModal = false;
  createdOrder: Order | null = null;
  isFormAutoFilled = false;
  
  @Select(CartStateClass.getCartItems) cartItems$!: Observable<CartItem[]>;
  cartItems: CartItem[] = [];
  checkoutForm: CheckoutForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Тюмень',
    deliveryMethod: 'courier',
    paymentMethod: 'cash',
    notes: '',
    couponCode: ''
  };

  deliveryMethods = [
    { value: 'courier', label: 'Курьерская доставка', price: 0, time: '1-2 дня' }
  ];

  paymentMethods = [
    { value: 'cash', label: 'Наличными при получении', icon: '💵' }
  ];

  selectedDelivery = this.deliveryMethods[0];
  selectedPayment = this.paymentMethods[0];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit() {
    this.cartItems$.subscribe(items => {
      this.cartItems = items;
    });

    // Автозаполнение формы для залогиненного пользователя
    this.autoFillFormForLoggedInUser();
  }

  autoFillFormForLoggedInUser() {
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        console.log('👤 Автозаполнение формы данными пользователя:', currentUser);
        
        let hasAutoFilledData = false;
        
        // Заполняем email
        if (currentUser.email) {
          this.checkoutForm.email = currentUser.email;
          hasAutoFilledData = true;
        }
        
        // Заполняем имя пользователя (если есть)
        if (currentUser.username) {
          // Пытаемся разделить username на имя и фамилию
          const nameParts = currentUser.username.split(' ');
          if (nameParts.length >= 2) {
            this.checkoutForm.firstName = nameParts[0];
            this.checkoutForm.lastName = nameParts.slice(1).join(' ');
          } else {
            this.checkoutForm.firstName = currentUser.username;
            this.checkoutForm.lastName = '';
          }
          hasAutoFilledData = true;
        }
        
        // Заполняем телефон (если есть)
        if (currentUser.phone) {
          this.checkoutForm.phone = currentUser.phone;
          hasAutoFilledData = true;
        }
        
        // Заполняем адрес (если есть)
        if (currentUser.address) {
          this.checkoutForm.address = currentUser.address;
          hasAutoFilledData = true;
        }
        
        // Устанавливаем флаг автозаполнения
        this.isFormAutoFilled = hasAutoFilledData;
        
        console.log('✅ Форма автозаполнена:', this.checkoutForm);
        console.log('🏷️ Флаг автозаполнения:', this.isFormAutoFilled);
      }
    }
  }



  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getDeliveryCost(): number {
    const subtotal = this.getSubtotal();
    // Доставка 100 руб если заказ менее 1000 руб, от 1000 - бесплатно
    return subtotal < 1000 ? 100 : 0;
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
    if (this.cartItems.length === 0) {
      this.error = 'Корзина пуста. Добавьте товары перед оформлением заказа.';
      return;
    }
    
    if (this.validateForm()) {
      this.loading = true;
      this.error = null;

      const fullAddress = `${this.checkoutForm.address}, ${this.checkoutForm.city}`;
      const fullName = `${this.checkoutForm.firstName} ${this.checkoutForm.lastName}`;
      
      const orderData = {
        items: this.cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        billing_address: fullAddress,
        shipping_address: fullAddress,
        payment_method: this.checkoutForm.paymentMethod,
        notes: this.checkoutForm.notes,
        coupon_code: this.checkoutForm.couponCode || undefined,
        guest_email: this.checkoutForm.email,
        guest_name: fullName,
        guest_phone: this.checkoutForm.phone
      };

      console.log('📦 Отправляемые данные заказа:', orderData);
      console.log('🛒 Товары в корзине:', this.cartItems);

      const isAuthenticated = this.authService.isAuthenticated();
      
      if (isAuthenticated) {
        // Создание заказа для авторизованного пользователя
        // Убираем гостевые поля для авторизованного пользователя
        const { guest_email, guest_name, guest_phone, ...userOrderData } = orderData;
        this.orderService.createOrder(userOrderData as CreateOrderRequest).subscribe({
          next: (order: Order) => {
            this.loading = false;
            this.createdOrder = order;
            this.store.dispatch(new ClearCart());
            this.showSuccessModal = true;
          },
          error: (error: any) => {
            this.loading = false;
            this.error = 'Ошибка создания заказа';
            console.error('Error creating order:', error);
          }
        });
      } else {
        // Создание заказа для гостя
        this.orderService.createGuestOrder(orderData as CreateGuestOrderRequest).subscribe({
          next: (order: Order) => {
            this.loading = false;
            this.createdOrder = order;
            this.store.dispatch(new ClearCart());
            this.showSuccessModal = true;
          },
          error: (error: any) => {
            this.loading = false;
            this.error = 'Ошибка создания заказа';
            console.error('Error creating guest order:', error);
          }
        });
      }
    }
  }

  validateForm(): boolean {
    const requiredFields = ['firstName', 'email', 'phone', 'address', 'city'];
    return requiredFields.every(field => this.checkoutForm[field as keyof CheckoutForm]?.trim() !== '');
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
    this.createdOrder = null;
  }

  viewOrder() {
    if (this.createdOrder) {
      this.router.navigate(['/order', this.createdOrder.id]);
    }
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }
}
