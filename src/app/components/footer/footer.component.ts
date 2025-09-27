import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  
  // Социальные сети
  socialLinks = [
    { name: 'VK', url: 'https://vk.com/tyumenkrasota72', icon: '📘' },
    { name: 'Telegram', url: 'https://t.me/krasota72ru', icon: '📱' }
  ];

  // Быстрые ссылки
  quickLinks = [
    { name: 'О нас', route: '/about' },
    { name: 'Контакты', route: '/contacts' },
    { name: 'Доставка', route: '/delivery' },
    { name: 'Политика конфиденциальности', route: '/privacy' },
    { name: 'Условия использования', route: '/terms' }
  ];

  // Контактная информация
  contactInfo = {
    email: 'krasota72tmn@gmail.com',
    phone: '+7 (912) 999-37-66',
    address: 'г. Тюмень, ул. Республики, 249/8',
    workingHours: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00'
  };
}
