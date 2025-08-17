import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  date: Date;
  items: number;
}

interface RecentUser {
  id: number;
  username: string;
  email: string;
  role: string;
  registrationDate: Date;
  lastLogin: Date;
}

interface LowStockProduct {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
  category: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeTab: string = 'dashboard';
  currentUser: User | null = null;
  loading = false;
  showDebugInfo = false;

  // Статистика
  stats: AdminStats = {
    totalUsers: 1247,
    totalProducts: 89,
    totalOrders: 3456,
    totalRevenue: 12450000,
    pendingOrders: 23,
    lowStockProducts: 7
  };

  // Последние заказы
  recentOrders: RecentOrder[] = [
    {
      id: 1001,
      customerName: 'Иван Иванов',
      customerEmail: 'ivan@example.com',
      total: 129999,
      status: 'pending',
      date: new Date('2024-01-20'),
      items: 2
    },
    {
      id: 1002,
      customerName: 'Мария Петрова',
      customerEmail: 'maria@example.com',
      total: 45999,
      status: 'processing',
      date: new Date('2024-01-20'),
      items: 1
    },
    {
      id: 1003,
      customerName: 'Алексей Сидоров',
      customerEmail: 'alex@example.com',
      total: 89999,
      status: 'shipped',
      date: new Date('2024-01-19'),
      items: 3
    }
  ];

  // Последние пользователи
  recentUsers: RecentUser[] = [
    {
      id: 1001,
      username: 'newuser1',
      email: 'user1@example.com',
      role: 'user',
      registrationDate: new Date('2024-01-20'),
      lastLogin: new Date('2024-01-20')
    },
    {
      id: 1002,
      username: 'newuser2',
      email: 'user2@example.com',
      role: 'user',
      registrationDate: new Date('2024-01-19'),
      lastLogin: new Date('2024-01-19')
    }
  ];

  // Товары с низким запасом
  lowStockProducts: LowStockProduct[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      currentStock: 2,
      minStock: 5,
      category: 'Электроника'
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      currentStock: 1,
      minStock: 3,
      category: 'Электроника'
    },
    {
      id: 3,
      name: 'AirPods Pro',
      currentStock: 0,
      minStock: 10,
      category: 'Электроника'
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Отладочная информация о токене
    console.log('=== Отладочная информация о токене ===');
    console.log('Токен:', this.authService.getToken());
    console.log('Информация из токена:', this.authService.getTokenInfo());
    console.log('Роль из токена:', this.authService.getRoleFromToken());
    console.log('ID пользователя из токена:', this.authService.getUserIdFromToken());
    console.log('Текущий пользователь:', this.currentUser);
    console.log('=====================================');
    
    // Проверяем, является ли пользователь админом
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Ожидает подтверждения',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    const statusClassMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClassMap[status] || '';
  }

  getRoleText(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Администратор',
      'user': 'Пользователь',
      'moderator': 'Модератор'
    };
    return roleMap[role] || role;
  }

  getRoleClass(role: string): string {
    const roleClassMap: { [key: string]: string } = {
      'admin': 'role-admin',
      'user': 'role-user',
      'moderator': 'role-moderator'
    };
    return roleClassMap[role] || '';
  }

  // Действия администратора
  viewOrderDetails(order: RecentOrder) {
    alert(`Детали заказа #${order.id}\nКлиент: ${order.customerName}\nEmail: ${order.customerEmail}\nСумма: ${this.formatPrice(order.total)}\nСтатус: ${this.getStatusText(order.status)}`);
  }

  updateOrderStatus(order: RecentOrder, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    order.status = newStatus;
    alert(`Статус заказа #${order.id} обновлен на "${this.getStatusText(newStatus)}"`);
  }

  viewUserDetails(user: RecentUser) {
    alert(`Детали пользователя #${user.id}\nИмя: ${user.username}\nEmail: ${user.email}\nРоль: ${this.getRoleText(user.role)}\nДата регистрации: ${this.formatDate(user.registrationDate)}`);
  }

  changeUserRole(user: RecentUser, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newRole = target.value;
    user.role = newRole;
    alert(`Роль пользователя ${user.username} изменена на "${this.getRoleText(newRole)}"`);
  }

  viewProductDetails(product: LowStockProduct) {
    alert(`Детали товара #${product.id}\nНазвание: ${product.name}\nТекущий запас: ${product.currentStock}\nМинимальный запас: ${product.minStock}\nКатегория: ${product.category}`);
  }

  restockProduct(product: LowStockProduct) {
    const newStock = prompt(`Введите новое количество для товара "${product.name}":`, product.currentStock.toString());
    if (newStock && !isNaN(Number(newStock))) {
      product.currentStock = Number(newStock);
      alert(`Запас товара "${product.name}" обновлен до ${newStock}`);
    }
  }

  // Навигация
  goToProducts() {
    this.router.navigate(['/products']);
  }

  goToUsers() {
    // Здесь можно добавить страницу управления пользователями
    alert('Страница управления пользователями');
  }

  goToOrders() {
    // Здесь можно добавить страницу управления заказами
    alert('Страница управления заказами');
  }

  goToAnalytics() {
    // Здесь можно добавить страницу аналитики
    alert('Страница аналитики');
  }

  exitAdmin() {
    this.router.navigate(['/']);
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
  }
}
