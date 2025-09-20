import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus, PaymentStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error: string | null = null;
  orderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrder();
      }
    });
  }

  loadOrder() {
    if (!this.orderId) return;

    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Ошибка загрузки заказа';
        this.loading = false;
        console.error('Error loading order:', error);
      }
    });
  }

  cancelOrder() {
    if (!this.orderId || !this.order) return;

    if (confirm('Вы уверены, что хотите отменить заказ?')) {
      this.orderService.cancelOrder(this.orderId).subscribe({
        next: () => {
          this.loadOrder(); // Перезагружаем заказ для обновления статуса
        },
        error: (error) => {
          this.error = 'Ошибка отмены заказа';
          console.error('Error cancelling order:', error);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/orders']);
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

  getStatusDescription(status: OrderStatus): string {
    const descriptions: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'Ваш заказ получен и ожидает подтверждения от администратора.',
      [OrderStatus.CONFIRMED]: 'Заказ подтвержден и готов к обработке.',
      [OrderStatus.PROCESSING]: 'Заказ находится в процессе обработки и подготовки к отправке.',
      [OrderStatus.SHIPPED]: 'Заказ отправлен и находится в пути к вам.',
      [OrderStatus.DELIVERED]: 'Заказ доставлен и получен.',
      [OrderStatus.CANCELLED]: 'Заказ был отменен.',
      [OrderStatus.REFUNDED]: 'Заказ был возвращен.'
    };
    return descriptions[status] || '';
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

  canCancelOrder(): boolean {
    return this.order ? 
      (this.order.status === OrderStatus.PENDING || this.order.status === OrderStatus.CONFIRMED) : 
      false;
  }

  getPaymentMethodLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'card': 'Банковская карта',
      'cash': 'Наличными при получении',
      'online': 'Онлайн оплата'
    };
    return methods[method] || method;
  }

  getPaymentStatusLabel(order: Order): string {
    // Если заказ доставлен, то он считается оплаченным
    if (order.status === OrderStatus.DELIVERED) {
      return 'Оплачен';
    }
    
    // Для остальных статусов используем payment_status из заказа
    const statusMap: { [key in PaymentStatus]: string } = {
      [PaymentStatus.PENDING]: 'Ожидает оплаты',
      [PaymentStatus.PAID]: 'Оплачен',
      [PaymentStatus.FAILED]: 'Ошибка оплаты',
      [PaymentStatus.REFUNDED]: 'Возвращен',
      [PaymentStatus.CANCELLED]: 'Отменен'
    };
    
    // Если payment_status не указан, показываем "Ожидает оплаты"
    const paymentStatus = order.payment_status || PaymentStatus.PENDING;
    return statusMap[paymentStatus] || 'Ожидает оплаты';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/placeholder.svg';
    }
  }
}
