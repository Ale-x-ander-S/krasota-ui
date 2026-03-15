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
  deliveryDate: string;
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
    deliveryDate: '',
    paymentMethod: 'cash',
    notes: '',
    couponCode: ''
  };

  deliveryMethods = [
    { value: 'courier', label: 'Курьерская доставка', time: '1-2 дня' }
  ];

  paymentMethods = [
    { value: 'cash', label: 'Наличными при получении', icon: '💵' },
    { value: 'bank_transfer', label: 'По счету', icon: '🏦' }
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
    
    // Инициализация даты доставки
    this.initializeDeliveryDate();
  }

  autoFillFormForLoggedInUser() {
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        
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
        
      }
    }
  }

  initializeDeliveryDate() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Если сейчас до 13:00, можно выбрать сегодняшний день
    // Если после 13:00, можно выбрать только завтрашний день
    let startDate = currentHour < 13 ? now : new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Если стартовая дата попадает на выходной или недоступную дату, ищем ближайший доступный день
    while (this.isWeekendDate(startDate) || this.isDisabledDate(startDate)) {
      startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    }
    
    // Устанавливаем дату по умолчанию
    this.checkoutForm.deliveryDate = this.formatDateForInput(startDate);
  }

  getAvailableDeliveryDates(): string[] {
    const dates: string[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Если сейчас до 13:00, можно выбрать сегодняшний день
    // Если после 13:00, можно выбрать только завтрашний день
    let startDate = currentHour < 13 ? now : new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Если стартовая дата попадает на выходной или недоступную дату, ищем ближайший доступный день для установки по умолчанию
    // Но в список включаем все даты, включая выходные и недоступные
    let defaultDate = new Date(startDate);
    while (this.isWeekendDate(defaultDate) || this.isDisabledDate(defaultDate)) {
      defaultDate = new Date(defaultDate.getTime() + 24 * 60 * 60 * 1000);
    }
    
    // Генерируем даты на 8 дней вперед (включая все дни, даже выходные и недоступные)
    for (let i = 0; i < 8; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      dates.push(this.formatDateForInput(date));
    }
    
    return dates;
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isWeekend(dateString: string): boolean {
    const date = new Date(dateString);
    // Выходные дни: суббота, воскресенье или даты 1-5 января
    return this.isWeekendDate(date) || this.isDisabledDate(date);
  }

  isWeekendDate(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Воскресенье или суббота
  }

  isDisabledDate(date: Date | string): boolean {
    const dateObj = date instanceof Date ? date : new Date(date);
    const month = dateObj.getMonth(); // 0-11, где 0 = январь, 11 = декабрь
    const day = dateObj.getDate();
    
    // Проверяем, является ли дата 31 декабря или 1-4 января
    return (month === 11 && day === 31) || (month === 0 && day >= 1 && day <= 4);
  }

  isDateDisabled(dateString: string): boolean {
    const date = new Date(dateString);
    return this.isDisabledDate(date);
  }

  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (this.isSameDay(date, today)) {
      return 'Сегодня';
    } else if (this.isSameDay(date, tomorrow)) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    }
  }

  formatDateForValue(dateString: string): string {
    // Конвертируем YYYY-MM-DD в DD-MM-YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
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
    this.checkoutForm.paymentMethod = method.value;
  }

  onSubmit() {
    if (this.cartItems.length === 0) {
      this.error = 'Корзина пуста. Добавьте товары перед оформлением заказа.';
      return;
    }
    
    if (this.validateForm()) {
      this.loading = true;
      this.error = null;

      // Дополнительная проверка перед отправкой (на случай обхода валидации)
      const email = this.checkoutForm.email?.trim();
      const phone = this.checkoutForm.phone?.trim();
      const firstName = this.checkoutForm.firstName?.trim();
      const address = this.checkoutForm.address?.trim();
      const city = this.checkoutForm.city?.trim();

      if (!email || !phone || !firstName || !address || !city) {
        this.error = 'Заполните все обязательные поля';
        this.loading = false;
        return;
      }

      // Проверка формата email и телефона перед отправкой
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.error = 'Введите корректный email';
        this.loading = false;
        return;
      }

      if (!this.isValidPhone(phone)) {
        this.error = 'Введите корректный номер телефона';
        this.loading = false;
        return;
      }

      const fullAddress = `${address}, ${city}`;
      const fullName = `${firstName} ${this.checkoutForm.lastName?.trim() || ''}`.trim();
      
      const orderData = {
        items: this.cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        billing_address: fullAddress,
        shipping_address: fullAddress,
        payment_method: this.checkoutForm.paymentMethod,
        delivery_date: this.checkoutForm.deliveryDate,
        notes: this.checkoutForm.notes?.trim() || undefined,
        coupon_code: this.checkoutForm.couponCode?.trim() || undefined,
        guest_email: email,
        guest_name: fullName,
        guest_phone: phone
      };

      console.log('orderData', orderData);


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
          }
        });
      } else {
        // Создание заказа для гостя - дополнительная проверка обязательных полей
        if (!orderData.guest_email || !orderData.guest_phone || !orderData.guest_name) {
          this.error = 'Email и телефон обязательны для оформления заказа';
          this.loading = false;
          return;
        }

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
          }
        });
      }
    }
  }

  validateForm(): boolean {
    // Проверка обязательных полей
    if (!this.checkoutForm.firstName || !this.checkoutForm.firstName.trim()) {
      this.error = 'Заполните поле "Имя"';
      return false;
    }

    if (!this.checkoutForm.email || !this.checkoutForm.email.trim()) {
      this.error = 'Заполните поле "Email"';
      return false;
    }

    // Валидация формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.checkoutForm.email.trim())) {
      this.error = 'Введите корректный email';
      return false;
    }

    if (!this.checkoutForm.phone || !this.checkoutForm.phone.trim()) {
      this.error = 'Заполните поле "Телефон"';
      return false;
    }

    // Валидация формата телефона
    if (!this.isValidPhone(this.checkoutForm.phone.trim())) {
      this.error = 'Введите корректный номер телефона';
      return false;
    }

    if (!this.checkoutForm.address || !this.checkoutForm.address.trim()) {
      this.error = 'Заполните поле "Адрес"';
      return false;
    }

    if (!this.checkoutForm.city || !this.checkoutForm.city.trim()) {
      this.error = 'Заполните поле "Город"';
      return false;
    }

    this.error = null;
    return true;
  }

  // Проверка корректности телефона
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  // Обработчик ввода телефона - очищает ошибку при корректном вводе
  onPhoneInput(): void {
    if (this.checkoutForm.phone && this.isValidPhone(this.checkoutForm.phone)) {
      // Очищаем ошибку, если она связана с телефоном
      if (this.error && this.error.includes('телефон')) {
        this.error = null;
      }
    }
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
