import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';

interface TeamMember {
  name: string;
  position: string;
  description: string;
  image: string;
}

interface CompanyStat {
  number: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  showMobileMenu: boolean = false;

  teamMembers: TeamMember[] = [
    {
      name: 'Александр Петров',
      position: 'Генеральный директор',
      description: 'Более 15 лет опыта в e-commerce. Основатель компании с видением создания лучшего онлайн-опыта для покупателей.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzI1NjNiZSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BUDwvdGV4dD48L3N2Zz4='
    },
    {
      name: 'Мария Сидорова',
      position: 'Директор по маркетингу',
      description: 'Эксперт в цифровом маркетинге и брендинге. Создает уникальные маркетинговые стратегии для роста компании.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2Y1OWUwYiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NUzwvdGV4dD48L3N2Zz4='
    },
    {
      name: 'Дмитрий Козлов',
      position: 'Технический директор',
      description: 'Обеспечивает надежную работу всех IT-систем и внедряет инновационные технологии для улучшения пользовательского опыта.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iIzEwYjI4MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ESzwvdGV4dD48L3N2Zz4='
    },
    {
      name: 'Анна Волкова',
      position: 'Руководитель отдела продаж',
      description: 'Управляет командой продаж и обеспечивает высокий уровень обслуживания клиентов.',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjEwMCIgZmlsbD0iI2Y0NzNhIiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BVjwvdGV4dD48L3N2Zz4='
    }
  ];

  companyStats: CompanyStat[] = [
    {
      number: '200+',
      label: 'Салонов красоты',
      icon: '💄'
    },
    {
      number: '500+',
      label: 'Товаров для красоты',
      icon: '📦'
    },
    {
      number: '5+',
      label: 'Лет на рынке',
      icon: '🎯'
    },
    {
      number: '24/7',
      label: 'Поддержка клиентов',
      icon: '🕒'
    }
  ];

  companyValues = [
    {
      title: 'Качество',
      description: 'Мы предлагаем только проверенные товары от надежных производителей',
      icon: '⭐'
    },
    {
      title: 'Надежность',
      description: 'Гарантируем безопасность покупок и своевременную доставку',
      icon: '🛡️'
    },
    {
      title: 'Инновации',
      description: 'Постоянно внедряем новые технологии для улучшения сервиса',
      icon: '🚀'
    },
    {
      title: 'Клиентоориентированность',
      description: 'Ставим интересы клиентов на первое место во всех решениях',
      icon: '❤️'
    }
  ];

  companyHistory = [
    {
      year: '2019',
      title: 'Основание компании',
      description: 'Krasota72 была основана с целью создания современного интернет-магазина'
    },
    {
      year: '2020',
      title: 'Расширение ассортимента',
      description: 'Каталог вырос до 50,000 товаров различных категорий'
    },
    {
      year: '2021',
      title: 'Запуск мобильного приложения',
      description: 'Представлено мобильное приложение для удобства покупок'
    },
    {
      year: '2022',
      title: 'Открытие складов',
      description: 'Запущены собственные склады для быстрой доставки'
    },
    {
      year: '2023',
      title: 'Международная экспансия',
      description: 'Начало работы с зарубежными поставщиками'
    },
    {
      year: '2024',
      title: 'Цифровая трансформация',
      description: 'Внедрение AI-технологий и персонализированных рекомендаций'
    }
  ];

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }
}
