import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  specifications?: string[];
  features?: string[];
  reviews?: Review[];
}

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  selectedImage: string = '';
  showMobileMenu: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      this.loadProduct(productId);
    });
  }

  loadProduct(id: number) {
    // Здесь можно загружать данные из сервиса
    // Пока используем моковые данные
    const products = this.getMockProducts();
    this.product = products.find(p => p.id === id) || null;
    
    if (this.product) {
      this.selectedImage = this.product.image;
    } else {
      this.router.navigate(['/products']);
    }
  }

  getMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Смартфон iPhone 15 Pro',
        price: 129999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN0FGRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGhvbmUgMTUgUHJvPC90ZXh0Pjwvc3ZnPg==',
        category: 'Электроника',
        description: 'Новейший iPhone с чипом A17 Pro и титановым корпусом. Этот смартфон представляет собой вершину технологических достижений Apple, сочетая в себе мощь, элегантность и инновации.',
        inStock: true,
        specifications: [
          'Экран: 6.1" Super Retina XDR OLED',
          'Процессор: A17 Pro',
          'Память: 128 ГБ',
          'Камера: 48 Мп + 12 Мп + 12 Мп',
          'Батарея: до 23 часов работы',
          'Материал корпуса: Титан'
        ],
        features: [
          'Dynamic Island',
          'Always-On Display',
          'USB-C разъем',
          'Поддержка 5G',
          'Face ID',
          'MagSafe зарядка'
        ],
        reviews: [
          {
            id: 1,
            author: 'Александр',
            rating: 5,
            comment: 'Отличный телефон! Камера просто супер, батарея держит долго.',
            date: '2024-01-15'
          },
          {
            id: 2,
            author: 'Мария',
            rating: 4,
            comment: 'Очень быстрый и красивый. Единственный минус - высокая цена.',
            date: '2024-01-10'
          }
        ]
      },
      {
        id: 2,
        name: 'Ноутбук MacBook Air M2',
        price: 149999,
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWNCb29rIEFpcjwvdGV4dD48L3N2Zz4=',
        category: 'Электроника',
        description: 'Ультратонкий ноутбук с чипом M2 и 18-часовой автономностью. Идеален для работы и творчества.',
        inStock: true,
        specifications: [
          'Экран: 13.6" Liquid Retina',
          'Процессор: Apple M2',
          'Память: 256 ГБ SSD',
          'Оперативная память: 8 ГБ',
          'Батарея: до 18 часов',
          'Вес: 1.24 кг'
        ],
        features: [
          'Чип Apple M2',
          'Retina дисплей',
          'Touch ID',
          'Force Touch трекпад',
          'Thunderbolt 4',
          'Wi-Fi 6'
        ],
        reviews: [
          {
            id: 1,
            author: 'Дмитрий',
            rating: 5,
            comment: 'Невероятно быстрый и тихий. Батарея держит весь день.',
            date: '2024-01-12'
          }
        ]
      }
    ];
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product && this.product.inStock) {
      // Здесь логика добавления в корзину
      console.log(`Добавлено в корзину: ${this.product.name}, количество: ${this.quantity}`);
      alert(`Товар "${this.product.name}" добавлен в корзину!`);
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ru-RU');
  }

  getRatingStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }
}
