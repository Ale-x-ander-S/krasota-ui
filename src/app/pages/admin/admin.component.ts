import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { UserService, User as ApiUser } from '../../services/user.service';
import { ProductService, Product, CreateProductData } from '../../services/product.service';
import { CategoryService, Category, CreateCategoryData, UpdateCategoryData } from '../../services/category.service';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus, OrderFilters } from '../../models/order.model';

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
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

  // Пользователи из API
  users: ApiUser[] = [];
  usersLoading = false;
  usersError = '';

  // Товары из API
  products: Product[] = [];
  productsLoading = false;
  productsError = '';
  currentPage = 1;
  totalProducts = 0;
  productsPerPage = 10;

  // Категории из API
  categories: Category[] = [];
  categoriesLoading = false;
  categoriesError = '';

  // Заказы из API
  orders: Order[] = [];
  ordersLoading = false;
  ordersError = '';
  orderFilters: OrderFilters = {};
  selectedOrder: Order | null = null;
  showOrderModal = false;

  // Фильтры товаров
  productFilters = {
    search: '',
    category_id: '',
    is_active: '',
    stock_status: ''
  };

  // Редактирование пользователя
  editingUser: ApiUser | null = null;
  editForm = {
    username: '',
    email: '',
    role: '',
    address: '',
    phone: '',
    is_email_active: false
  };

  // Редактирование товара
  editingProduct: Product | null = null;
  productEditForm = {
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    image_url: '',
    stock: 0,
    stock_type: 'piece',
    color: '',
    size: '',
    sku: '',
    sort_order: 0,
    is_active: true,
    is_featured: false
  };

  // Создание нового товара
  creatingProduct = false;
  productCreateForm = {
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    image_url: '',
    stock: 0,
    stock_type: 'piece',
    color: '',
    size: '',
    sku: '',
    sort_order: 0,
    is_active: true,
    is_featured: false
  };

  // Просмотр товара
  viewingProduct: Product | null = null;

  // Категории
  creatingCategory = false;
  editingCategory: Category | null = null;
  viewingCategory: Category | null = null;
  categoryCreateForm: CreateCategoryData = {
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  };
  categoryEditForm: UpdateCategoryData = {
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  };

  // Ошибки валидации
  validationErrors: { [key: string]: string } = {};
  productValidationErrors: { [key: string]: string } = {};
  categoryValidationErrors: { [key: string]: string } = {};

  // Уведомления
  notification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  // Статистика
  stats: AdminStats = {
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
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
    private userService: UserService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private orderService: OrderService,
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
    
    // Проверяем токен
    if (!this.authService.getToken()) {
      console.error('Токен отсутствует');
      this.router.navigate(['/auth']);
      return;
    }
    
    // Проверяем, является ли пользователь админом
    const userRole = this.authService.getRoleFromToken();
    if (!userRole || userRole !== 'admin') {
      console.error('Пользователь не является администратором. Роль:', userRole);
      this.router.navigate(['/']);
      return;
    }

    // Загружаем статистику при инициализации
    this.loadInitialStats();

    // Загружаем пользователей, товары и категории при инициализации
    this.loadUsers();
    this.loadProducts();
    this.loadCategories();
  }

  // Загрузка пользователей с API
  loadUsers() {
    this.usersLoading = true;
    this.usersError = '';

    // Проверяем токен перед запросом
    if (!this.authService.getToken()) {
      this.usersError = 'Токен аутентификации отсутствует';
      this.usersLoading = false;
      this.router.navigate(['/auth']);
      return;
    }

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.stats.totalUsers = users.length; // Обновляем статистику
        this.usersLoading = false;
        console.log('Пользователи загружены:', users);
      },
      error: (error) => {
        this.usersLoading = false;
        console.error('Ошибка загрузки пользователей:', error);
        
        if (error.status === 401) {
          this.usersError = 'Ошибка аутентификации. Токен недействителен или истек';
          this.router.navigate(['/auth']);
        } else if (error.status === 403) {
          this.usersError = 'Доступ запрещен. Требуются права администратора';
          this.router.navigate(['/']);
        } else {
          this.usersError = 'Ошибка загрузки пользователей: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        }
        
        this.showNotification(this.usersError, 'error');
      }
    });
  }

  // Удаление пользователя
  deleteUser(user: ApiUser) {
    if (user.id === this.currentUser?.id) {
      this.showNotification('Нельзя удалить самого себя!', 'error');
      return;
    }

    if (confirm(`Вы уверены, что хотите удалить пользователя "${user.username}"? Это действие нельзя отменить.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.showNotification(`Пользователь "${user.username}" успешно удален`, 'success');
        },
        error: (error) => {
          this.showNotification(`Ошибка удаления пользователя: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
        }
      });
    }
  }

  // Открыть форму редактирования
  editUser(user: ApiUser) {
    this.editingUser = user;
    this.editForm = {
      username: user.username,
      email: user.email,
      role: user.role,
      address: user.address || '',
      phone: user.phone || '',
      is_email_active: user.is_email_active
    };
  }

  // Закрыть форму редактирования
  cancelEdit() {
    this.editingUser = null;
    this.editForm = {
      username: '',
      email: '',
      role: '',
      address: '',
      phone: '',
      is_email_active: false
    };
  }

  // Валидация формы
  validateForm(): boolean {
    this.validationErrors = {};

    // Проверка имени пользователя
    if (!this.editForm.username.trim()) {
      this.validationErrors['username'] = 'Имя пользователя обязательно';
    } else if (this.editForm.username.trim().length < 3) {
      this.validationErrors['username'] = 'Имя пользователя должно содержать минимум 3 символа';
    } else if (this.editForm.username.trim().length > 50) {
      this.validationErrors['username'] = 'Имя пользователя не должно превышать 50 символов';
    }

    // Проверка email
    if (!this.editForm.email.trim()) {
      this.validationErrors['email'] = 'Email обязателен';
    } else if (!this.isValidEmail(this.editForm.email)) {
      this.validationErrors['email'] = 'Введите корректный email';
    }

    // Проверка роли
    if (!this.editForm.role) {
      this.validationErrors['role'] = 'Выберите роль пользователя';
    }

    // Проверка телефона (если указан)
    if (this.editForm.phone && !this.isValidPhone(this.editForm.phone)) {
      this.validationErrors['phone'] = 'Введите корректный номер телефона';
    }

    // Проверка адреса (если указан)
    if (this.editForm.address && this.editForm.address.trim().length > 200) {
      this.validationErrors['address'] = 'Адрес не должен превышать 200 символов';
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  // Проверка корректности email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Проверка корректности телефона
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  // Очистка ошибок валидации для конкретного поля
  clearFieldError(fieldName: string) {
    if (this.validationErrors[fieldName]) {
      delete this.validationErrors[fieldName];
    }
  }

  // Проверка наличия ошибки для поля
  hasFieldError(fieldName: string): boolean {
    return !!this.validationErrors[fieldName];
  }

  // Получение ошибки для поля
  getFieldError(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }

  // Сохранить изменения пользователя
  saveUserChanges() {
    if (!this.editingUser) return;

    // Валидация формы
    if (!this.validateForm()) {
      this.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
      return;
    }

    const updatedData = {
      username: this.editForm.username.trim(),
      email: this.editForm.email.trim(),
      role: this.editForm.role,
      address: this.editForm.address.trim() || undefined,
      phone: this.editForm.phone.trim() || undefined,
      is_email_active: this.editForm.is_email_active
    };

    this.userService.updateUser(this.editingUser.id, updatedData).subscribe({
      next: (updatedUser) => {
        // Обновляем пользователя в списке
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        
        this.showNotification(`Пользователь "${updatedUser.username}" успешно обновлен`, 'success');
        this.cancelEdit();
      },
      error: (error) => {
        this.showNotification(`Ошибка обновления пользователя: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    
    // Загружаем данные при переключении на соответствующий таб
    if (tab === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    } else if (tab === 'users' && this.users.length === 0) {
      this.loadUsers();
    } else if (tab === 'products' && this.products.length === 0) {
      this.loadProducts();
    } else if (tab === 'categories' && this.categories.length === 0) {
      this.loadCategories();
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  // Форматирование даты из строки
  formatDateString(dateString: string): string {
    return this.formatDate(new Date(dateString));
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

  // Действия администратора для дашборда
  viewOrderDetails(order: RecentOrder) {
    // Для дашборда показываем простой alert
    alert(`Детали заказа #${order.id}\nКлиент: ${order.customerName}\nEmail: ${order.customerEmail}\nСумма: ${this.formatPrice(order.total)}\nСтатус: ${this.getStatusText(order.status)}`);
  }

  updateOrderStatus(order: RecentOrder, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    order.status = newStatus;
    alert(`Статус заказа #${order.id} обновлен на "${this.getStatusText(newStatus)}"`);
  }

  viewUserDetails(user: ApiUser) {
    alert(`Детали пользователя #${user.id}\nИмя: ${user.username}\nEmail: ${user.email}\nРоль: ${this.getRoleText(user.role)}\nEmail активирован: ${user.is_email_active ? 'Да' : 'Нет'}\nДата регистрации: ${this.formatDateString(user.created_at)}`);
  }

  changeUserRole(user: RecentUser, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newRole = target.value;
    user.role = newRole;
    alert(`Роль пользователя ${user.username} изменена на "${this.getRoleText(newRole)}"`);
  }

  // Просмотр деталей товара
  viewProductDetails(product: Product) {
    this.viewingProduct = product;
  }

  // Закрыть форму просмотра товара
  closeProductView() {
    this.viewingProduct = null;
  }

  // Открыть форму редактирования товара
  editProduct(product: Product) {
    // Закрываем окно просмотра, если оно открыто
    if (this.viewingProduct) {
      this.closeProductView();
    }
    
    this.editingProduct = product;
    this.productEditForm = {
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      image_url: product.image_url,
      stock: product.stock,
      stock_type: product.stock_type,
      color: product.color || '',
      size: product.size || '',
      sku: product.sku,
      sort_order: product.sort_order,
      is_active: product.is_active,
      is_featured: product.is_featured
    };
    this.productValidationErrors = {};
  }

  // Закрыть форму редактирования товара
  cancelProductEdit() {
    this.editingProduct = null;
    this.productEditForm = {
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      image_url: '',
      stock: 0,
      stock_type: 'piece',
      color: '',
      size: '',
      sku: '',
      sort_order: 0,
      is_active: true,
      is_featured: false
    };
    this.productValidationErrors = {};
  }

  // Валидация формы товара
  validateProductForm(): boolean {
    this.productValidationErrors = {};

    // Проверка названия
    if (!this.productEditForm.name.trim()) {
      this.productValidationErrors['name'] = 'Название товара обязательно';
    } else if (this.productEditForm.name.trim().length < 3) {
      this.productValidationErrors['name'] = 'Название должно содержать минимум 3 символа';
    } else if (this.productEditForm.name.trim().length > 100) {
      this.productValidationErrors['name'] = 'Название не должно превышать 100 символов';
    }

    // Проверка описания
    if (!this.productEditForm.description.trim()) {
      this.productValidationErrors['description'] = 'Описание товара обязательно';
    } else if (this.productEditForm.description.trim().length < 10) {
      this.productValidationErrors['description'] = 'Описание должно содержать минимум 10 символов';
    }

    // Проверка цены
    if (this.productEditForm.price <= 0) {
      this.productValidationErrors['price'] = 'Цена должна быть больше 0';
    }

    // Проверка категории
    if (this.productEditForm.category_id <= 0) {
      this.productValidationErrors['category_id'] = 'Выберите категорию';
    }

    // Проверка запаса
    if (this.productEditForm.stock < 0) {
      this.productValidationErrors['stock'] = 'Запас не может быть отрицательным';
    }

    // Проверка SKU
    if (!this.productEditForm.sku.trim()) {
      this.productValidationErrors['sku'] = 'SKU обязателен';
    }

    return Object.keys(this.productValidationErrors).length === 0;
  }

  // Очистка ошибок валидации товара для конкретного поля
  clearProductFieldError(fieldName: string) {
    if (this.productValidationErrors[fieldName]) {
      delete this.productValidationErrors[fieldName];
    }
  }

  // Проверка наличия ошибки для поля товара
  hasProductFieldError(fieldName: string): boolean {
    return !!this.productValidationErrors[fieldName];
  }

  // Получение ошибки для поля товара
  getProductFieldError(fieldName: string): string {
    return this.productValidationErrors[fieldName] || '';
  }

  // Сохранить изменения товара
  saveProductChanges() {
    if (!this.editingProduct) return;

    // Валидация формы
    if (!this.validateProductForm()) {
      this.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
      return;
    }

    const updatedData = {
      name: this.productEditForm.name.trim(),
      description: this.productEditForm.description.trim(),
      price: this.productEditForm.price,
      category_id: this.productEditForm.category_id,
      image_url: this.productEditForm.image_url.trim(),
      stock: this.productEditForm.stock,
      stock_type: this.productEditForm.stock_type,
      color: this.productEditForm.color.trim() || undefined,
      size: this.productEditForm.size.trim() || undefined,
      sku: this.productEditForm.sku.trim(),
      sort_order: this.productEditForm.sort_order,
      is_active: this.productEditForm.is_active,
      is_featured: this.productEditForm.is_featured
    };

    this.productService.updateProduct(this.editingProduct.id, updatedData).subscribe({
      next: (updatedProduct) => {
        // Обновляем товар в списке
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        
        this.showNotification(`Товар "${updatedProduct.name}" успешно обновлен`, 'success');
        this.cancelProductEdit();
      },
      error: (error) => {
        this.showNotification(`Ошибка обновления товара: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
      }
    });
  }

  // Удаление товара
  deleteProduct(product: Product) {
    if (confirm(`Вы уверены, что хотите удалить товар "${product.name}"? Это действие нельзя отменить.`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
          this.totalProducts--;
          this.showNotification(`Товар "${product.name}" успешно удален`, 'success');
        },
        error: (error) => {
          this.showNotification(`Ошибка удаления товара: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
        }
      });
    }
  }

  restockProduct(product: LowStockProduct) {
    const newStock = prompt(`Введите новое количество для товара "${product.name}":`, product.currentStock.toString());
    if (newStock && !isNaN(Number(newStock))) {
      product.currentStock = Number(newStock);
      alert(`Запас товара "${product.name}" обновлен до ${newStock}`);
    }
  }

  // Навигация
  // Убираю методы быстрых действий, так как они больше не нужны
  // goToProducts, goToOrders, goToUsers, goToAnalytics

  exitAdmin() {
    this.router.navigate(['/']);
  }

  toggleDebugInfo() {
    this.showDebugInfo = !this.showDebugInfo;
  }

  // Показать уведомление
  showNotification(message: string, type: 'success' | 'error') {
    this.notification = {
      show: true,
      message,
      type
    };
    
    // Автоматически скрыть через 5 секунд
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }

  // Скрыть уведомление
  hideNotification() {
    this.notification.show = false;
  }

  // Загрузка товаров с API (для администраторов - все товары включая неактивные)
  loadProducts() {
    this.productsLoading = true;
    this.productsError = '';

    const params = {
      page: this.currentPage,
      limit: this.productsPerPage,
      ...this.productFilters
    };

    // Используем админский эндпоинт для получения всех товаров включая неактивные
    this.productService.getAllProducts(params).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalProducts = response.total;
        this.stats.totalProducts = response.total; // Обновляем статистику дашборда
        this.productsLoading = false;
        console.log('Все товары загружены (включая неактивные):', response);
      },
      error: (error) => {
        this.productsError = 'Ошибка загрузки товаров: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        this.productsLoading = false;
        this.showNotification(`Ошибка загрузки товаров: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
        console.error('Ошибка загрузки товаров:', error);
      }
    });
  }

  // Динамический поиск товаров
  onProductSearchChange() {
    // Сбрасываем на первую страницу при поиске
    this.currentPage = 1;
    // Загружаем товары с новыми фильтрами
    this.loadProducts();
  }

  // Сброс фильтров товаров
  resetProductFilters() {
    this.productFilters = {
      search: '',
      category_id: '',
      is_active: '',
      stock_status: ''
    };
    this.currentPage = 1;
    this.loadProducts();
  }

  // Изменение страницы товаров
  changeProductPage(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  // Получение общего количества страниц товаров
  get totalProductPages(): number {
    return Math.ceil(this.totalProducts / this.productsPerPage);
  }

  // Обработка ошибки загрузки изображения
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  // Открыть форму создания товара
  createProduct() {
    this.creatingProduct = true;
    this.productCreateForm = {
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      image_url: '',
      stock: 0,
      stock_type: 'piece',
      color: '',
      size: '',
      sku: '',
      sort_order: 0,
      is_active: true,
      is_featured: false
    };
    this.productValidationErrors = {};
  }

  // Закрыть форму создания товара
  cancelProductCreate() {
    this.creatingProduct = false;
    this.productCreateForm = {
      name: '',
      description: '',
      price: 0,
      category_id: 0,
      image_url: '',
      stock: 0,
      stock_type: 'piece',
      color: '',
      size: '',
      sku: '',
      sort_order: 0,
      is_active: true,
      is_featured: false
    };
    this.productValidationErrors = {};
  }

  // Валидация формы создания товара
  validateProductCreateForm(): boolean {
    this.productValidationErrors = {};

    // Проверка названия
    if (!this.productCreateForm.name.trim()) {
      this.productValidationErrors['name'] = 'Название товара обязательно';
    } else if (this.productCreateForm.name.trim().length < 3) {
      this.productValidationErrors['name'] = 'Название должно содержать минимум 3 символа';
    } else if (this.productCreateForm.name.trim().length > 100) {
      this.productValidationErrors['name'] = 'Название не должно превышать 100 символов';
    }

    // Проверка описания
    if (!this.productCreateForm.description.trim()) {
      this.productValidationErrors['description'] = 'Описание товара обязательно';
    } else if (this.productCreateForm.description.trim().length < 10) {
      this.productValidationErrors['description'] = 'Описание должно содержать минимум 10 символов';
    }

    // Проверка цены
    if (this.productCreateForm.price <= 0) {
      this.productValidationErrors['price'] = 'Цена должна быть больше 0';
    }

    // Проверка категории
    if (this.productCreateForm.category_id <= 0) {
      this.productValidationErrors['category_id'] = 'Выберите категорию';
    }

    // Проверка запаса
    if (this.productCreateForm.stock < 0) {
      this.productValidationErrors['stock'] = 'Запас не может быть отрицательным';
    }

    // Проверка SKU
    if (!this.productCreateForm.sku.trim()) {
      this.productValidationErrors['sku'] = 'SKU обязателен';
    }

    return Object.keys(this.productValidationErrors).length === 0;
  }

  // Создать новый товар
  createNewProduct() {
    // Валидация формы
    if (!this.validateProductCreateForm()) {
      this.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
      return;
    }

    const newProductData = {
      name: this.productCreateForm.name.trim(),
      description: this.productCreateForm.description.trim(),
      price: this.productCreateForm.price,
      category_id: this.productCreateForm.category_id,
      image_url: this.productCreateForm.image_url.trim(),
      stock: this.productCreateForm.stock,
      stock_type: this.productCreateForm.stock_type,
      color: this.productCreateForm.color.trim() || undefined,
      size: this.productCreateForm.size.trim() || undefined,
      sku: this.productCreateForm.sku.trim(),
      sort_order: this.productCreateForm.sort_order,
      is_active: this.productCreateForm.is_active,
      is_featured: this.productCreateForm.is_featured
    };

    this.productService.createProduct(newProductData).subscribe({
      next: (newProduct) => {
        // Добавляем новый товар в список
        this.products.unshift(newProduct);
        this.totalProducts++;
        
        this.showNotification(`Товар "${newProduct.name}" успешно создан`, 'success');
        this.cancelProductCreate();
      },
      error: (error) => {
        this.showNotification(`Ошибка создания товара: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
      }
    });
  }

  // Геттеры для аналитических данных
  get newUsersCount(): number {
    return Math.floor(this.stats.totalUsers * 0.15);
  }

  get popularProductsCount(): number {
    return Math.floor(this.stats.totalProducts * 0.2);
  }

  // ===== МЕТОДЫ ДЛЯ КАТЕГОРИЙ =====

  // Загрузка категорий
  loadCategories() {
    this.categoriesLoading = true;
    this.categoriesError = '';

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.stats.totalCategories = categories.length; // Обновляем статистику
        this.categoriesLoading = false;
        console.log('Категории загружены:', categories);
      },
      error: (error) => {
        this.categoriesError = 'Ошибка загрузки категорий: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        this.categoriesLoading = false;
        this.showNotification(`Ошибка загрузки категорий: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
        console.error('Ошибка загрузки категорий:', error);
      }
    });
  }

  // Создание категории
  createCategory() {
    this.creatingCategory = true;
    this.categoryCreateForm = {
      name: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    };
    this.categoryValidationErrors = {};
  }

  // Отмена создания категории
  cancelCategoryCreate() {
    this.creatingCategory = false;
    this.categoryCreateForm = {
      name: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    };
    this.categoryValidationErrors = {};
  }

  // Создание новой категории
  createNewCategory() {
    if (!this.validateCategoryCreateForm()) {
      this.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
      return;
    }

    const newCategoryData = {
      name: this.categoryCreateForm.name.trim(),
      description: this.categoryCreateForm.description.trim(),
      image_url: this.categoryCreateForm.image_url.trim() || '',
      is_active: this.categoryCreateForm.is_active,
      sort_order: this.categoryCreateForm.sort_order
    };

    this.categoryService.createCategory(newCategoryData).subscribe({
      next: (newCategory) => {
        // Создаем новый массив для плавного обновления
        const updatedCategories = [...this.categories, newCategory];
        updatedCategories.sort((a, b) => a.sort_order - b.sort_order);
        
        // Плавно обновляем список
        this.categories = updatedCategories;
        this.stats.totalCategories = updatedCategories.length; // Обновляем статистику
        
        this.showNotification(`Категория "${newCategory.name}" успешно создана`, 'success');
        this.cancelCategoryCreate();
      },
      error: (error) => {
        this.showNotification(`Ошибка создания категории: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
      }
    });
  }

  // Редактирование категории
  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryEditForm = {
      name: category.name,
      description: category.description,
      image_url: category.image_url,
      is_active: category.is_active,
      sort_order: category.sort_order
    };
    this.categoryValidationErrors = {};
  }

  // Отмена редактирования категории
  cancelCategoryEdit() {
    this.editingCategory = null;
    this.categoryEditForm = {
      name: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    };
    this.categoryValidationErrors = {};
  }

  // Сохранение изменений категории
  saveCategoryChanges() {
    if (!this.validateCategoryEditForm()) {
      this.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
      return;
    }

    if (!this.editingCategory) return;

    const updateData = {
      name: this.categoryEditForm.name?.trim() || '',
      description: this.categoryEditForm.description?.trim() || '',
      image_url: this.categoryEditForm.image_url?.trim() || '',
      is_active: this.categoryEditForm.is_active || true,
      sort_order: this.categoryEditForm.sort_order || 0
    };

    this.categoryService.updateCategory(this.editingCategory.id, updateData).subscribe({
      next: (updatedCategory) => {
        // Создаем новый массив для плавного обновления
        const updatedCategories = this.categories.map(c => 
          c.id === updatedCategory.id ? updatedCategory : c
        );
        
        // Сортируем по новому порядку
        updatedCategories.sort((a, b) => a.sort_order - b.sort_order);
        
        // Плавно обновляем список
        this.categories = updatedCategories;
        
        this.showNotification(`Категория "${updatedCategory.name}" успешно обновлена`, 'success');
        this.cancelCategoryEdit();
      },
      error: (error) => {
        this.showNotification(`Ошибка обновления категории: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
      }
    });
  }

  // Просмотр деталей категории
  viewCategoryDetails(category: Category) {
    this.viewingCategory = category;
  }

  // Закрытие просмотра категории
  closeCategoryView() {
    this.viewingCategory = null;
  }

  // Удаление категории
  deleteCategory(category: Category) {
    if (category.product_count > 0) {
      this.showNotification('Нельзя удалить категорию, в которой есть товары', 'error');
      return;
    }

    if (confirm(`Вы уверены, что хотите удалить категорию "${category.name}"? Это действие нельзя отменить.`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.categories = this.categories.filter(c => c.id !== category.id);
          this.stats.totalCategories = this.categories.length; // Обновляем статистику
          this.showNotification(`Категория "${category.name}" успешно удалена`, 'success');
        },
        error: (error) => {
          this.showNotification(`Ошибка удаления категории: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
        }
      });
    }
  }

  // Валидация формы создания категории
  validateCategoryCreateForm(): boolean {
    this.categoryValidationErrors = {};

    if (!this.categoryCreateForm.name.trim()) {
      this.categoryValidationErrors['name'] = 'Название категории обязательно';
    } else if (this.categoryCreateForm.name.trim().length < 3) {
      this.categoryValidationErrors['name'] = 'Название должно содержать минимум 3 символа';
    } else if (this.categoryCreateForm.name.trim().length > 100) {
      this.categoryValidationErrors['name'] = 'Название не должно превышать 100 символов';
    }

    if (!this.categoryCreateForm.description.trim()) {
      this.categoryValidationErrors['description'] = 'Описание категории обязательно';
    } else if (this.categoryCreateForm.description.trim().length < 10) {
      this.categoryValidationErrors['description'] = 'Описание должно содержать минимум 10 символов';
    }

    // Поле изображения необязательно, но если указано, проверяем формат
    if (this.categoryCreateForm.image_url.trim() && !this.isValidUrl(this.categoryCreateForm.image_url.trim())) {
      this.categoryValidationErrors['image_url'] = 'Введите корректный URL изображения';
    }

    return Object.keys(this.categoryValidationErrors).length === 0;
  }

  // Валидация формы редактирования категории
  validateCategoryEditForm(): boolean {
    this.categoryValidationErrors = {};

    if (!this.categoryEditForm.name?.trim()) {
      this.categoryValidationErrors['name'] = 'Название категории обязательно';
    } else if (this.categoryEditForm.name.trim().length < 3) {
      this.categoryValidationErrors['name'] = 'Название должно содержать минимум 3 символа';
    } else if (this.categoryEditForm.name.trim().length > 100) {
      this.categoryValidationErrors['name'] = 'Название не должно превышать 100 символов';
    }

    if (!this.categoryEditForm.description?.trim()) {
      this.categoryValidationErrors['description'] = 'Описание категории обязательно';
    } else if (this.categoryEditForm.description.trim().length < 10) {
      this.categoryValidationErrors['description'] = 'Описание должно содержать минимум 10 символов';
    }

    // Поле изображения необязательно, но если указано, проверяем формат
    if (this.categoryEditForm.image_url?.trim() && !this.isValidUrl(this.categoryEditForm.image_url.trim())) {
      this.categoryValidationErrors['image_url'] = 'Введите корректный URL изображения';
    }

    return Object.keys(this.categoryValidationErrors).length === 0;
  }

  // Методы для работы с ошибками валидации категорий
  hasCategoryFieldError(field: string): boolean {
    return !!this.categoryValidationErrors[field];
  }

  getCategoryFieldError(field: string): string {
    return this.categoryValidationErrors[field] || '';
  }

  clearCategoryFieldError(field: string) {
    delete this.categoryValidationErrors[field];
  }

  // Обработка ошибок изображений категорий
  onCategoryImageError(event: any) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.svg';
  }

  // TrackBy функции для оптимизации рендеринга
  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }

  // Валидация URL
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ===== МЕТОДЫ ДЛЯ РАБОТЫ С ЗАКАЗАМИ =====

  // Загрузка заказов
  loadOrders() {
    this.ordersLoading = true;
    this.ordersError = '';
    
    this.orderService.getAllOrders(this.orderFilters).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.ordersLoading = false;
        this.updateOrderStats();
      },
      error: (error) => {
        this.ordersError = 'Ошибка загрузки заказов';
        this.ordersLoading = false;
        console.error('Error loading orders:', error);
      }
    });
  }

  // Обновление статистики заказов
  updateOrderStats() {
    this.stats.totalOrders = this.orders.length;
    this.stats.pendingOrders = this.orders.filter(o => o.status === OrderStatus.PENDING).length;
    this.stats.totalRevenue = this.orders
      .filter(o => o.status === OrderStatus.DELIVERED)
      .reduce((sum, o) => sum + o.total_amount, 0);
  }

  // Просмотр деталей заказа
  viewOrderDetailsModal(order: Order) {
    this.selectedOrder = order;
    this.showOrderModal = true;
  }

  // Закрытие модального окна заказа
  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  // Изменение статуса заказа
  updateOrderStatusModal(order: Order, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as OrderStatus;
    
    if (newStatus === order.status) return;

    this.orderService.updateOrder(order.id, { status: newStatus }).subscribe({
      next: () => {
        order.status = newStatus;
        this.updateOrderStats();
        this.showNotification('Статус заказа обновлен', 'success');
      },
      error: (error) => {
        this.showNotification('Ошибка обновления статуса', 'error');
        console.error('Error updating order status:', error);
        // Возвращаем предыдущее значение
        target.value = order.status;
      }
    });
  }

  // Получение класса для статуса заказа
  getOrderStatusClass(status: OrderStatus): string {
    const statusClasses: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.CONFIRMED]: 'status-confirmed',
      [OrderStatus.PROCESSING]: 'status-processing',
      [OrderStatus.SHIPPED]: 'status-shipped',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
      [OrderStatus.REFUNDED]: 'status-refunded'
    };
    return statusClasses[status] || 'status-unknown';
  }

  // Получение текста статуса заказа
  getOrderStatusText(status: OrderStatus): string {
    const statusTexts: { [key in OrderStatus]: string } = {
      [OrderStatus.PENDING]: 'Ожидает подтверждения',
      [OrderStatus.CONFIRMED]: 'Подтвержден',
      [OrderStatus.PROCESSING]: 'В обработке',
      [OrderStatus.SHIPPED]: 'Отправлен',
      [OrderStatus.DELIVERED]: 'Доставлен',
      [OrderStatus.CANCELLED]: 'Отменен',
      [OrderStatus.REFUNDED]: 'Возвращен'
    };
    return statusTexts[status] || 'Неизвестно';
  }

  // Фильтрация заказов
  onOrderFilterChange() {
    this.loadOrders();
  }

  // Очистка фильтров заказов
  clearOrderFilters() {
    this.orderFilters = {};
    this.loadOrders();
  }

  // TrackBy функция для заказов
  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }

  // Загрузка начальной статистики
  loadInitialStats() {
    // Загружаем заказы для статистики
    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.updateOrderStats();
      },
      error: (error) => {
        console.error('Error loading orders for stats:', error);
        // Оставляем заглушки если не удалось загрузить
      }
    });
  }

  // Получить название категории по ID
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Категория #${categoryId}`;
  }
}
