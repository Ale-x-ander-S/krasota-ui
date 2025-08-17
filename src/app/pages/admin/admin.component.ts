import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { UserService, User as ApiUser } from '../../services/user.service';
import { ProductService, Product, CreateProductData } from '../../services/product.service';

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

  // Фильтры товаров
  productFilters = {
    search: '',
    category_id: '',
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined
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

  // Ошибки валидации
  validationErrors: { [key: string]: string } = {};
  productValidationErrors: { [key: string]: string } = {};

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

    // Загружаем пользователей и товары при инициализации
    this.loadUsers();
    this.loadProducts();
  }

  // Загрузка пользователей с API
  loadUsers() {
    this.usersLoading = true;
    this.usersError = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.stats.totalUsers = users.length; // Обновляем статистику
        this.usersLoading = false;
        console.log('Пользователи загружены:', users);
      },
      error: (error) => {
        this.usersError = 'Ошибка загрузки пользователей: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        this.usersLoading = false;
        this.showNotification(`Ошибка загрузки пользователей: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
        console.error('Ошибка загрузки пользователей:', error);
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

  // Загрузка товаров с API
  loadProducts() {
    this.productsLoading = true;
    this.productsError = '';

    const params = {
      page: this.currentPage,
      limit: this.productsPerPage,
      ...this.productFilters
    };

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalProducts = response.total;
        this.stats.totalProducts = response.total; // Обновляем статистику дашборда
        this.productsLoading = false;
        console.log('Товары загружены:', response);
      },
      error: (error) => {
        this.productsError = 'Ошибка загрузки товаров: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        this.productsLoading = false;
        this.showNotification(`Ошибка загрузки товаров: ${error.error?.message || error.message || 'Неизвестная ошибка'}`, 'error');
        console.error('Ошибка загрузки товаров:', error);
      }
    });
  }

  // Применение фильтров товаров
  applyProductFilters() {
    this.currentPage = 1;
    this.loadProducts();
  }

  // Сброс фильтров товаров
  resetProductFilters() {
    this.productFilters = {
      search: '',
      category_id: '',
      min_price: undefined,
      max_price: undefined
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
}
