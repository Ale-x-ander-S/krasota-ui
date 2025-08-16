import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface Address {
  name: string;
  street: string;
  house: string;
  apartment?: string;
  city: string;
  postalCode: string;
}

interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  publicProfile: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  showMobileMenu: boolean = false;
  activeTab: string = 'profile';
  isUpdating: boolean = false;

  userProfile: UserProfile = {
    firstName: 'Иван',
    lastName: 'Иванов',
    email: 'ivan.ivanov@example.com',
    phone: '+7 (999) 123-45-67',
    birthDate: '1990-01-01'
  };

  editProfile: UserProfile = { ...this.userProfile };

  orders: Order[] = [
    {
      id: 1001,
      date: new Date('2024-01-15'),
      status: 'delivered',
      total: 279998,
      items: [
        {
          id: 1,
          name: 'Смартфон iPhone 15 Pro',
          price: 129999,
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN0FGRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGhvbmUgMTUgUHJvPC90ZXh0Pjwvc3ZnPg==',
          category: 'Электроника',
          quantity: 1
        },
        {
          id: 2,
          name: 'Ноутбук MacBook Air M2',
          price: 149999,
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWNCb29rIEFpcjwvdGV4dD48L3N2Zz4=',
          category: 'Электроника',
          quantity: 1
        }
      ]
    },
    {
      id: 1002,
      date: new Date('2024-01-10'),
      status: 'shipped',
      total: 24999,
      items: [
        {
          id: 3,
          name: 'Наушники AirPods Pro',
          price: 24999,
          image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGOTUwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BaXJQb2RzIFBybzwvdGV4dD48L3N2Zz4=',
          category: 'Электроника',
          quantity: 1
        }
      ]
    }
  ];

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

  addresses: Address[] = [
    {
      name: 'Дом',
      street: 'ул. Примерная',
      house: 'д. 123',
      apartment: 'кв. 456',
      city: 'Москва',
      postalCode: '123456'
    }
  ];

  settings: UserSettings = {
    emailNotifications: true,
    smsNotifications: false,
    publicProfile: false
  };

  constructor(private router: Router) {}

  ngOnInit() {
    // Загрузка данных пользователя
  }

  getUserInitials(): string {
    return `${this.userProfile.firstName.charAt(0)}${this.userProfile.lastName.charAt(0)}`;
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
      year: 'numeric'
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

  updateProfile() {
    this.isUpdating = true;
    
    // Имитация обновления профиля
    setTimeout(() => {
      this.userProfile = { ...this.editProfile };
      this.isUpdating = false;
      alert('Профиль обновлен успешно!');
    }, 1500);
  }

  repeatOrder(order: Order) {
    // Добавление товаров из заказа в корзину
    alert(`Товары из заказа #${order.id} добавлены в корзину`);
    this.router.navigate(['/cart']);
  }

  viewOrderDetails(order: Order) {
    alert(`Детали заказа #${order.id}\nСтатус: ${this.getStatusText(order.status)}\nДата: ${this.formatDate(order.date)}`);
  }

  addToCart(product: Product) {
    alert(`${product.name} добавлен в корзину`);
  }

  removeFromFavorites(product: Product) {
    this.favorites = this.favorites.filter(fav => fav.id !== product.id);
    alert(`${product.name} удален из избранного`);
  }

  editAddress(index: number) {
    alert(`Редактирование адреса: ${this.addresses[index].name}`);
  }

  deleteAddress(index: number) {
    if (confirm('Вы уверены, что хотите удалить этот адрес?')) {
      this.addresses.splice(index, 1);
      alert('Адрес удален');
    }
  }

  addNewAddress() {
    alert('Добавление нового адреса');
  }

  changePassword() {
    alert('Функция изменения пароля');
  }

  saveSettings() {
    alert('Настройки сохранены');
  }

  logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
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
}
