import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { AuthService, User } from '../../services/auth.service';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  favorites?: number[]; // Добавляем поле favorites
}



interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface UserSettings {
  is_email_active: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  showMobileMenu: boolean = false;
  activeTab: string = 'profile';
  isUpdating: boolean = false;
  showSuccessMessage: boolean = false;

  // Уведомления
  notification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  userProfile: UserProfile = {
    id: 0,
    username: '',
    email: '',
    role: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    created_at: '',
    updated_at: '',
    favorites: [] // Инициализируем favorites
  };

  editProfile: UserProfile = { ...this.userProfile };



  favorites: Product[] = [
    {
      id: 101,
      name: 'Беспроводные наушники Sony WH-1000XM4',
      price: 29999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Tb255IFdILTEwMDBYTTQ8L3RleHQ+PC9zdmc+',
      category: 'Электроника'
    },
    {
      id: 102,
      name: 'Умные часы Apple Watch Series 7',
      price: 39999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcHBsZSBXYXRjaCBTZXJpZXMgNzwvdGV4dD48L3N2Zz4=',
      category: 'Электроника'
    }
  ];

  settings: UserSettings = {
    is_email_active: true,
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Загружаем реальные данные пользователя
    this.loadUserProfile();
  }

  // Показать уведомление
  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notification.message = message;
    this.notification.type = type;
    this.notification.show = true;
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  }

  // Скрыть уведомление
  hideNotification() {
    this.notification.show = false;
  }

  private loadUserProfile() {
    // Проверяем, авторизован ли пользователь
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    // Получаем профиль через API
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.userProfile = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.username.split(' ')[0] || user.username,
          lastName: user.username.split(' ')[1] || '',
          phone: user.phone || '',
          address: user.address || '',
          created_at: user.created_at,
          updated_at: user.updated_at,
          favorites: user.favorites || [] // Загружаем избранные товары
        };
        
        // Копируем для редактирования
        this.editProfile = { ...this.userProfile };
        
        // Загружаем настройки из профиля
        this.settings.is_email_active = user.is_email_active;

        // Загружаем избранные товары
        this.loadFavorites();
      },
      error: (error) => {
        // Если ошибка 401, перенаправляем на страницу входа
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth']);
          return;
        }
        // Если API недоступен, используем данные из AuthService
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.userProfile = {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role,
            firstName: currentUser.username.split(' ')[0] || currentUser.username,
            lastName: currentUser.username.split(' ')[1] || '',
            phone: currentUser.phone || '',
            address: currentUser.address || '',
            created_at: currentUser.created_at,
            updated_at: currentUser.updated_at,
            favorites: currentUser.favorites || [] // Загружаем избранные товары
          };
          
          this.editProfile = { ...this.userProfile };
          
          // Загружаем настройки из профиля
          this.settings.is_email_active = currentUser.is_email_active;

          // Загружаем избранные товары
          this.loadFavorites();
        } else {
          this.router.navigate(['/auth']);
        }
      }
    });
  }

  getUserInitials(): string {
    if (this.userProfile.firstName && this.userProfile.lastName) {
      return `${this.userProfile.firstName.charAt(0)}${this.userProfile.lastName.charAt(0)}`;
    } else if (this.userProfile.username) {
      return this.userProfile.username.charAt(0).toUpperCase();
    }
    return 'U';
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: Date): string {
    // Проверяем, что дата валидна
    if (!date || isNaN(date.getTime())) {
      return 'Дата не указана';
    }
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  parseDate(dateString: string): Date | null {
    if (!dateString) {
      return null;
    }
    
    const date = new Date(dateString);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  }

  // Безопасное форматирование строки даты
  formatDateString(dateString: string): string {
    const date = this.parseDate(dateString);
    if (!date) {
      return 'Дата не указана';
    }
    return this.formatDate(date);
  }



  getRoleText(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Администратор',
      'user': 'Пользователь',
      'moderator': 'Модератор'
    };
    return roleMap[role] || role;
  }

  updateProfile() {
    // Валидация
    if (!this.editProfile.phone || !this.editProfile.phone.trim()) {
      alert('Телефон обязателен для заполнения');
      return;
    }

    if (!this.isValidPhone(this.editProfile.phone)) {
      alert('Введите корректный номер телефона');
      return;
    }

    this.isUpdating = true;
    
    // Подготавливаем данные для API
    const profileData = {
      email: this.editProfile.email,
      phone: this.editProfile.phone,
      address: this.editProfile.address
    };
    
    // Отправляем запрос на обновление профиля
    this.authService.updateProfile(profileData).subscribe({
      next: (updatedUser) => {
        // Обновляем локальные данные
        this.userProfile = { ...this.editProfile };
        this.isUpdating = false;
        
        // Показываем уведомление об успешном обновлении
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        this.isUpdating = false;
        
        // Показываем ошибку
        alert('Ошибка обновления профиля. Попробуйте еще раз.');
      }
    });
  }

  // Проверка корректности телефона
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }



  addToCart(product: Product) {
    alert(`${product.name} добавлен в корзину`);
  }

  removeFromFavorites(product: Product) {
    // Убираем товар из локального массива
    this.favorites = this.favorites.filter(fav => fav.id !== product.id);
    
    // Обновляем массив favorites в профиле пользователя
    if (this.userProfile.favorites) {
      this.userProfile.favorites = this.userProfile.favorites.filter(id => id !== product.id);
    }
    
    // Отправляем обновление на сервер
    const profileData = {
      favorites: this.userProfile.favorites
    };
    
    this.authService.updateProfile(profileData).subscribe({
      next: (updatedUser) => {
      },
      error: (error) => {
        // Возвращаем товар обратно при ошибке
        this.favorites.push(product);
        if (this.userProfile.favorites) {
          this.userProfile.favorites.push(product.id);
        }
      }
    });
  }

  saveSettings() {
    // Отправляем настройку через API
    this.authService.updateEmailStatus(this.settings.is_email_active).subscribe({
      next: (response) => {
        // Показываем уведомление об успешном сохранении
        this.showNotification('Настройки успешно сохранены!', 'success');
      },
      error: (error) => {
        this.showNotification('Ошибка сохранения настроек. Попробуйте еще раз.', 'error');
      }
    });
  }

  logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
      this.authService.logout();
      this.router.navigate(['/auth']);
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  getCartItemCount(): number {
    // Имитация получения количества товаров в корзине
    return Math.floor(Math.random() * 5) + 1;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  // Обработка ошибки загрузки изображения
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  // Загрузка избранных товаров
  loadFavorites() {
    if (this.userProfile.favorites && this.userProfile.favorites.length > 0) {
      // Получаем товары по ID из favorites
      this.favorites = [];
      this.userProfile.favorites.forEach((productId: number) => {
        // Здесь можно добавить вызов API для получения товара по ID
        // Пока используем моковые данные для демонстрации
        const mockProduct = {
          id: productId,
          name: `Товар #${productId}`,
          price: Math.floor(Math.random() * 10000) + 1000,
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0ICM8L3RleHQ+PC9zdmc+',
          category: 'Категория'
        };
        this.favorites.push(mockProduct);
      });
    }
  }
}
