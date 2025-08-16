import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  brand?: string;
  weight?: string;
  dimensions?: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'https://api.krasota72.ru/products'; // Замени на реальный API
  private readonly mockDelay = 500; // Имитация задержки сети

  // Моковые данные для демонстрации
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Смартфон iPhone 15 Pro',
      price: 129999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN0FGRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGhvbmUgMTUgUHJvPC90ZXh0Pjwvc3ZnPg==',
      category: 'Электроника',
      description: 'Новейший iPhone с чипом A17 Pro и титановым корпусом',
      inStock: true,
      rating: 4.8,
      reviews: 156,
      brand: 'Apple',
      weight: '187g',
      dimensions: '146.7 x 71.5 x 8.25 mm'
    },
    {
      id: 2,
      name: 'Ноутбук MacBook Air M2',
      price: 149999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWNCb29rIEFpcjwvdGV4dD48L3N2Zz4=',
      category: 'Электроника',
      description: 'Ультратонкий ноутбук с чипом M2 и 18-часовой автономностью',
      inStock: true,
      rating: 4.9,
      reviews: 89,
      brand: 'Apple',
      weight: '1.24kg',
      dimensions: '304.1 x 212.4 x 11.3 mm'
    },
    {
      id: 3,
      name: 'Наушники AirPods Pro',
      price: 24999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGOTUwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BaXJQb2RzIFBybzwvdGV4dD48L3N2Zz4=',
      category: 'Электроника',
      description: 'Беспроводные наушники с активным шумоподавлением',
      inStock: false,
      rating: 4.7,
      reviews: 234,
      brand: 'Apple',
      weight: '5.4g',
      dimensions: '30.9 x 21.8 x 24.0 mm'
    },
    {
      id: 4,
      name: 'Кроссовки Nike Air Max',
      price: 15999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGQjY2QiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OaWtlIEFpciBNYXg8L3RleHQ+PC9zdmc+',
      category: 'Обувь',
      description: 'Стильные кроссовки с технологией Air Max',
      inStock: true,
      rating: 4.6,
      reviews: 78,
      brand: 'Nike',
      weight: '320g',
      dimensions: 'EU 42'
    },
    {
      id: 5,
      name: 'Джинсы Levi\'s 501',
      price: 8999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRFQ0RDNCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5MZXZpJ3MgNTAxPC90ZXh0Pjwvc3ZnPg==',
      category: 'Одежда',
      description: 'Классические джинсы прямого кроя',
      inStock: true,
      rating: 4.5,
      reviews: 123,
      brand: 'Levi\'s',
      weight: '450g',
      dimensions: 'W32 L32'
    },
    {
      id: 6,
      name: 'Сумка Michael Kors',
      price: 45999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzlCNTlCNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NaWNoYWVsIEtvcnM8L3RleHQ+PC9zdmc+',
      category: 'Аксессуары',
      description: 'Элегантная кожаная сумка для повседневного использования',
      inStock: true,
      rating: 4.8,
      reviews: 67,
      brand: 'Michael Kors',
      weight: '850g',
      dimensions: '30 x 25 x 12 cm'
    },
    {
      id: 7,
      name: 'Часы Apple Watch Series 9',
      price: 39999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGQjMzMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcHBsZSBXYXRjaDwvdGV4dD48L3N2Zz4=',
      category: 'Электроника',
      description: 'Умные часы с новыми функциями здоровья',
      inStock: true,
      rating: 4.9,
      reviews: 189,
      brand: 'Apple',
      weight: '31.9g',
      dimensions: '41mm'
    },
    {
      id: 8,
      name: 'Куртка The North Face',
      price: 29999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIjJFQ0M3MSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Ob3J0aCBGYWNlPC90ZXh0Pjwvc3ZnPg==',
      category: 'Одежда',
      description: 'Теплая зимняя куртка с водоотталкивающим покрытием',
      inStock: true,
      rating: 4.7,
      reviews: 95,
      brand: 'The North Face',
      weight: '1.2kg',
      dimensions: 'L'
    },
    // Добавляем больше товаров для демонстрации пагинации
    {
      id: 9,
      name: 'Планшет iPad Pro 12.9',
      price: 189999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGFkIFBybzwvdGV4dD48L3N2Zz4=',
      category: 'Электроника',
      description: 'Мощный планшет для профессионалов с дисплеем Liquid Retina XDR',
      inStock: true,
      rating: 4.9,
      reviews: 234,
      brand: 'Apple',
      weight: '682g',
      dimensions: '280.6 x 214.9 x 6.4 mm'
    },
    {
      id: 10,
      name: 'Игровая консоль PlayStation 5',
      price: 59999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QUzU8L3RleHQ+PC9zdmc+',
      category: 'Электроника',
      description: 'Новейшая игровая консоль с поддержкой 4K и ray tracing',
      inStock: true,
      rating: 4.8,
      reviews: 567,
      brand: 'Sony',
      weight: '4.5kg',
      dimensions: '390 x 260 x 104 mm'
    },
    {
      id: 11,
      name: 'Беспроводные наушники Sony WH-1000XM4',
      price: 29999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Tb255IFdILTEwMDBYTTQ8L3RleHQ+PC9zdmc+',
      category: 'Электроника',
      description: 'Лучшие в мире наушники с шумоподавлением',
      inStock: true,
      rating: 4.9,
      reviews: 456,
      brand: 'Sony',
      weight: '254g',
      dimensions: '167 x 185 x 71 mm'
    },
    {
      id: 12,
      name: 'Кроссовки Adidas Ultraboost',
      price: 18999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BZGlkYXMgVWx0cmFib29zdDwvdGV4dD48L3N2Zz4=',
      category: 'Обувь',
      description: 'Беговые кроссовки с технологией Boost для максимального комфорта',
      inStock: true,
      rating: 4.7,
      reviews: 234,
      brand: 'Adidas',
      weight: '310g',
      dimensions: 'EU 42'
    },
    {
      id: 13,
      name: 'Футболка Nike Dri-FIT',
      price: 3999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGQjY2QiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OaWtlIERyaS1GSVQ8L3RleHQ+PC9zdmc+',
      category: 'Одежда',
      description: 'Спортивная футболка с технологией влагоотведения',
      inStock: true,
      rating: 4.6,
      reviews: 189,
      brand: 'Nike',
      weight: '180g',
      dimensions: 'L'
    },
    {
      id: 14,
      name: 'Солнцезащитные очки Ray-Ban Aviator',
      price: 15999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SYXktQmFuPC90ZXh0Pjwvc3ZnPg==',
      category: 'Аксессуары',
      description: 'Классические солнцезащитные очки в стиле авиатора',
      inStock: true,
      rating: 4.8,
      reviews: 156,
      brand: 'Ray-Ban',
      weight: '32g',
      dimensions: '58mm'
    },
    {
      id: 15,
      name: 'Рюкзак Herschel Little America',
      price: 12999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IZXJzY2hlbDwvdGV4dD48L3N2Zz4=',
      category: 'Аксессуары',
      description: 'Стильный городской рюкзак с множеством карманов',
      inStock: true,
      rating: 4.7,
      reviews: 98,
      brand: 'Herschel',
      weight: '1.1kg',
      dimensions: '43 x 30 x 16 cm'
    },
    {
      id: 16,
      name: 'Клавиатура Logitech MX Keys',
      price: 12999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2dpdGVjaCBNWCBLZXlzPC90ZXh0Pjwvc3ZnPg==',
      category: 'Электроника',
      description: 'Беспроводная клавиатура с подсветкой и эргономичным дизайном',
      inStock: true,
      rating: 4.8,
      reviews: 234,
      brand: 'Logitech',
      weight: '810g',
      dimensions: '430 x 20 x 15 mm'
    },
    {
      id: 17,
      name: 'Мышь Logitech MX Master 3',
      price: 8999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2dpdGVjaCBNWCBNYXN0ZXIgMzwvdGV4dD48L3N2Zz4=',
      category: 'Электроника',
      description: 'Эргономичная беспроводная мышь с точным сенсором',
      inStock: true,
      rating: 4.9,
      reviews: 345,
      brand: 'Logitech',
      weight: '141g',
      dimensions: '124.9 x 84.3 x 51 mm'
    },
    {
      id: 18,
      name: 'Монитор Dell UltraSharp 27"',
      price: 45999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EZWxsIFVsdHJhU2hhcnA8L3RleHQ+PC9zdmc+',
      category: 'Электроника',
      description: 'Профессиональный монитор с разрешением 4K и точной цветопередачей',
      inStock: true,
      rating: 4.9,
      reviews: 123,
      brand: 'Dell',
      weight: '6.8kg',
      dimensions: '612 x 363 x 65 mm'
    },
    {
      id: 19,
      name: 'Коврик для мыши SteelSeries QcK',
      price: 1999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TdGVlbFNlcmllcyBRY0s8L3RleHQ+PC9zdmc+',
      category: 'Аксессуары',
      description: 'Профессиональный коврик для геймеров с точным отслеживанием',
      inStock: true,
      rating: 4.6,
      reviews: 89,
      brand: 'SteelSeries',
      weight: '350g',
      dimensions: '450 x 400 x 2 mm'
    },
    {
      id: 20,
      name: 'Внешний SSD Samsung T7',
      price: 15999,
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TYW1zdW5nIFQ3PC90ZXh0Pjwvc3ZnPg==',
      category: 'Электроника',
      description: 'Быстрый внешний SSD с интерфейсом USB 3.2 Gen 2',
      inStock: true,
      rating: 4.8,
      reviews: 234,
      brand: 'Samsung',
      weight: '58g',
      dimensions: '85 x 57 x 8 mm'
    }
  ];

  constructor(private http: HttpClient) {}

  // Получить все продукты с фильтрацией
  getProducts(filters: ProductFilters = {}, page: number = 1, limit: number = 10): Observable<ProductResponse> {
    // В реальном проекте здесь будет HTTP запрос
    // return this.http.get<ProductResponse>(this.apiUrl, { params: this.buildParams(filters, page, limit) });
    
    // Пока используем моковые данные
    return of(this.mockProducts).pipe(
      delay(this.mockDelay),
      map(products => this.filterProducts(products, filters)),
      map(filteredProducts => this.paginateProducts(filteredProducts, page, limit))
    );
  }

  // Получить продукт по ID
  getProductById(id: number): Observable<Product | null> {
    // return this.http.get<Product>(`${this.apiUrl}/${id}`);
    
    const product = this.mockProducts.find(p => p.id === id);
    return of(product || null).pipe(delay(this.mockDelay));
  }

  // Получить категории
  getCategories(): Observable<string[]> {
    // return this.http.get<string[]>(`${this.apiUrl}/categories`);
    
    const categories = [...new Set(this.mockProducts.map(p => p.category))];
    return of(categories).pipe(delay(this.mockDelay));
  }

  // Поиск продуктов
  searchProducts(query: string): Observable<Product[]> {
    // return this.http.get<Product[]>(`${this.apiUrl}/search`, { params: { q: query } });
    
    const results = this.mockProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.brand?.toLowerCase().includes(query.toLowerCase())
    );
    return of(results).pipe(delay(this.mockDelay));
  }

  // Проверить доступность продукта
  checkProductAvailability(productId: number): Observable<boolean> {
    // return this.http.get<{available: boolean}>(`${this.apiUrl}/${productId}/availability`).pipe(
    //   map(response => response.available)
    // );
    
    const product = this.mockProducts.find(p => p.id === productId);
    return of(product?.inStock || false).pipe(delay(this.mockDelay));
  }

  // Получить похожие продукты
  getSimilarProducts(productId: number, limit: number = 4): Observable<Product[]> {
    // return this.http.get<Product[]>(`${this.apiUrl}/${productId}/similar`, { params: { limit } });
    
    const product = this.mockProducts.find(p => p.id === productId);
    if (!product) return of([]);
    
    const similar = this.mockProducts
      .filter(p => p.id !== productId && p.category === product.category)
      .slice(0, limit);
    
    return of(similar).pipe(delay(this.mockDelay));
  }

  // Приватные методы для фильтрации и пагинации
  private filterProducts(products: Product[], filters: ProductFilters): Product[] {
    let filtered = [...products];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.brand?.toLowerCase().includes(search)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.inStock !== undefined) {
      filtered = filtered.filter(p => p.inStock === filters.inStock);
    }

    // Сортировка
    if (filters.sortBy) {
      filtered = this.sortProducts(filtered, filters.sortBy);
    }

    return filtered;
  }

  private sortProducts(products: Product[], sortBy: string): Product[] {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  private paginateProducts(products: Product[], page: number, limit: number): ProductResponse {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProducts = products.slice(start, end);

    return {
      products: paginatedProducts,
      total: products.length,
      page,
      limit
    };
  }

  private buildParams(filters: ProductFilters, page: number, limit: number): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
    if (filters.inStock !== undefined) params = params.set('inStock', filters.inStock.toString());
    if (filters.sortBy) params = params.set('sortBy', filters.sortBy);

    return params;
  }
}
