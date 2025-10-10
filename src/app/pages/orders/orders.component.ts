import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus, OrderFilters } from '../../models/order.model';
import { Store } from '@ngxs/store';
import { AddToCart } from '../../store/cart/cart.actions';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  filters: OrderFilters = {};
  
  statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: OrderStatus.PENDING, label: 'Ожидает подтверждения' },
    { value: OrderStatus.CONFIRMED, label: 'Подтвержден' },
    { value: OrderStatus.PROCESSING, label: 'В обработке' },
    { value: OrderStatus.SHIPPED, label: 'Отправлен' },
    { value: OrderStatus.DELIVERED, label: 'Доставлен' },
    { value: OrderStatus.CANCELLED, label: 'Отменен' }
  ];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = null;
    
    this.orderService.getUserOrders(this.filters).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Ошибка загрузки заказов';
        this.loading = false;
      }
    });
  }

  onFilterChange() {
    this.loadOrders();
  }

  onStatusChange(status: string) {
    this.filters.status = status as OrderStatus || undefined;
    this.loadOrders();
  }

  onDateFromChange(date: string) {
    this.filters.date_from = date || undefined;
    this.loadOrders();
  }

  onDateToChange(date: string) {
    this.filters.date_to = date || undefined;
    this.loadOrders();
  }

  onSearchChange(search: string) {
    this.filters.search = search || undefined;
    this.loadOrders();
  }

  clearFilters() {
    this.filters = {};
    this.loadOrders();
  }

  viewOrder(orderId: number) {
    this.router.navigate(['/order', orderId]);
  }


  getStatusLabel(status: OrderStatus): string {
    const statusMap: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'Ожидает подтверждения',
      [OrderStatus.CONFIRMED]: 'Подтвержден',
      [OrderStatus.PROCESSING]: 'В обработке',
      [OrderStatus.SHIPPED]: 'Отправлен',
      [OrderStatus.DELIVERED]: 'Доставлен',
      [OrderStatus.CANCELLED]: 'Отменен',
      [OrderStatus.REFUNDED]: 'Возвращен'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: OrderStatus): string {
    const classMap: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.CONFIRMED]: 'status-confirmed',
      [OrderStatus.PROCESSING]: 'status-processing',
      [OrderStatus.SHIPPED]: 'status-shipped',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
      [OrderStatus.REFUNDED]: 'status-refunded'
    };
    return classMap[status] || '';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canRepeatOrder(order: Order): boolean {
    // Позволяем повторить заказ для всех статусов, кроме отмененных и возвращенных
    return order.status !== OrderStatus.CANCELLED && 
           order.status !== OrderStatus.REFUNDED;
  }

  repeatOrder(order: Order): void {
    // Добавляем товары из заказа в корзину без подтверждения и уведомлений
    order.items.forEach(item => {
      this.store.dispatch(new AddToCart({
        id: item.product_id,
        name: item.product_name || `Товар #${item.product_id}`,
        price: item.price,
        quantity: item.quantity,
        image_url: this.getProductImage(item),
        category_id: 1, // Временное значение, так как в OrderItem нет category_id
        category_name: 'Категория не указана',
        description: '',
        stock: 999, // Предполагаем, что товар в наличии
        stock_type: 'in_stock',
        sku: `SKU-${item.product_id}`
      }));
    });
    
    // Переходим в корзину
    this.router.navigate(['/cart']);
  }

  getProductImage(item: any): string {
    // Проверяем различные возможные пути к изображению
    if (item.product_image) {
      return item.product_image;
    }
    if (item.image_url) {
      return item.image_url;
    }
    if (item.image) {
      return item.image;
    }
    
    // Попробуем стандартные пути к изображениям
    const standardPaths = [
      `assets/images/products/product_${item.product_id}.jpg`,
      `assets/images/products/product_${item.product_id}.png`,
      `assets/images/products/product_${item.product_id}.webp`,
      `http://45.12.229.112:8080/images/products/${item.product_id}.jpg`,
      `http://45.12.229.112:8080/images/products/${item.product_id}.png`,
      `http://45.12.229.112:8080/images/products/${item.product_id}.webp`
    ];
    
    // Возвращаем первый стандартный путь (браузер покажет placeholder если файл не найден)
    return standardPaths[0];
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/placeholder.svg';
    }
  }

  getPaymentMethodLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'card': 'Банковская карта',
      'cash': 'Наличными при получении',
      'online': 'Онлайн оплата'
    };
    return methods[method] || method;
  }
}
