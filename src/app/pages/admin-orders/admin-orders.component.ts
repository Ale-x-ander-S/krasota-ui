import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus, OrderFilters, UpdateOrderRequest } from '../../models/order.model';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  filters: OrderFilters = {};
  selectedOrder: Order | null = null;
  showUpdateModal = false;
  updateForm: UpdateOrderRequest = {};
  
  // Статистика
  orderStats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  };
  
  // Массовые операции
  selectedOrders: Set<number> = new Set();
  showBulkActions = false;
  
  // Enum для использования в шаблоне
  OrderStatus = OrderStatus;
  
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
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated() || !this.isAdmin()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.loadOrders();
  }

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'admin';
  }

  loadOrders() {
    this.loading = true;
    this.error = null;
    
    this.orderService.getAllOrders(this.filters).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Ошибка загрузки заказов';
        this.loading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  calculateStats() {
    this.orderStats = {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === OrderStatus.PENDING).length,
      confirmed: this.orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
      processing: this.orders.filter(o => o.status === OrderStatus.PROCESSING).length,
      shipped: this.orders.filter(o => o.status === OrderStatus.SHIPPED).length,
      delivered: this.orders.filter(o => o.status === OrderStatus.DELIVERED).length,
      cancelled: this.orders.filter(o => o.status === OrderStatus.CANCELLED).length,
      totalRevenue: this.orders
        .filter(o => o.status === OrderStatus.DELIVERED)
        .reduce((sum, o) => sum + o.total_amount, 0)
    };
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

  openUpdateModal(order: Order) {
    this.selectedOrder = order;
    this.updateForm = {
      status: order.status,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      notes: order.notes
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
    this.selectedOrder = null;
    this.updateForm = {};
  }

  updateOrder() {
    if (!this.selectedOrder) return;

    this.orderService.updateOrder(this.selectedOrder.id, this.updateForm).subscribe({
      next: () => {
        this.closeUpdateModal();
        this.loadOrders();
      },
      error: (error) => {
        this.error = 'Ошибка обновления заказа';
        console.error('Error updating order:', error);
      }
    });
  }

  cancelOrder(orderId: number) {
    if (confirm('Вы уверены, что хотите отменить заказ?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (error) => {
          this.error = 'Ошибка отмены заказа';
          console.error('Error cancelling order:', error);
        }
      });
    }
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

  canUpdateOrder(order: Order): boolean {
    return order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED;
  }

  canCancelOrder(order: Order): boolean {
    return order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED;
  }

  getDeliveryMethodLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'courier': 'Курьерская доставка',
      'pickup': 'Самовывоз',
      'post': 'Почта России'
    };
    return methods[method] || method;
  }

  getPaymentMethodLabel(method: string): string {
    const methods: { [key: string]: string } = {
      'card': 'Банковская карта',
      'cash': 'Наличными при получении',
      'online': 'Онлайн оплата'
    };
    return methods[method] || method;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/placeholder.svg';
    }
  }

  // Массовые операции
  toggleOrderSelection(orderId: number) {
    if (this.selectedOrders.has(orderId)) {
      this.selectedOrders.delete(orderId);
    } else {
      this.selectedOrders.add(orderId);
    }
    this.showBulkActions = this.selectedOrders.size > 0;
  }

  selectAllOrders() {
    this.orders.forEach(order => this.selectedOrders.add(order.id));
    this.showBulkActions = true;
  }

  clearSelection() {
    this.selectedOrders.clear();
    this.showBulkActions = false;
  }

  bulkUpdateStatus(newStatus: OrderStatus) {
    if (this.selectedOrders.size === 0) return;

    const orderIds = Array.from(this.selectedOrders);
    const promises = orderIds.map(id => 
      this.orderService.updateOrder(id, { status: newStatus }).toPromise()
    );

    Promise.all(promises).then(() => {
      this.loadOrders();
      this.clearSelection();
    }).catch(error => {
      this.error = 'Ошибка массового обновления заказов';
      console.error('Bulk update error:', error);
    });
  }

  bulkCancelOrders() {
    if (this.selectedOrders.size === 0) return;
    
    if (confirm(`Вы уверены, что хотите отменить ${this.selectedOrders.size} заказов?`)) {
      const orderIds = Array.from(this.selectedOrders);
      const promises = orderIds.map(id => 
        this.orderService.cancelOrder(id).toPromise()
      );

      Promise.all(promises).then(() => {
        this.loadOrders();
        this.clearSelection();
      }).catch(error => {
        this.error = 'Ошибка массовой отмены заказов';
        console.error('Bulk cancel error:', error);
      });
    }
  }
}
