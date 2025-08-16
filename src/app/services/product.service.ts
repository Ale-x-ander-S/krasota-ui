import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category_slug: string;
  description: string;
  stock: number;
  stock_type: string;
  sku: string;
  color: string;
  size: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'name' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
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
  private readonly apiUrl = 'http://45.12.229.112:8080/api/v1/products'; // Реальный API
  private readonly mockDelay = 500; // Имитация задержки сети

  // Моковые данные для демонстрации
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'Смартфон iPhone 15 Pro',
      price: 129999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN0FGRiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGhvbmUgMTUgUHJvPC90ZXh0Pjwvc3ZnPg==',
      category_slug: 'electronics',
      description: 'Новейший iPhone с чипом A17 Pro и титановым корпусом',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'IPHONE15PRO',
      color: 'Space Black',
      size: '6.1"',
      is_active: true,
      is_featured: true,
      sort_order: 1,
      created_at: '2023-01-01T10:00:00Z',
      updated_at: '2023-01-01T10:00:00Z'
    },
    {
      id: 2,
      name: 'Ноутбук MacBook Air M2',
      price: 149999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NYWNCb29rIEFpcjwvdGV4dD48L3N2Zz4=',
      category_slug: 'electronics',
      description: 'Ультратонкий ноутбук с чипом M2 и 18-часовой автономностью',
      stock: 5,
      stock_type: 'in_stock',
      sku: 'MACBOOKAIRM2',
      color: 'Silver',
      size: '13.3"',
      is_active: true,
      is_featured: false,
      sort_order: 2,
      created_at: '2023-01-02T10:00:00Z',
      updated_at: '2023-01-02T10:00:00Z'
    },
    {
      id: 3,
      name: 'Наушники AirPods Pro',
      price: 24999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGOTUwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BaXJQb2RzIFBybzwvdGV4dD48L3N2Zz4=',
      category_slug: 'electronics',
      description: 'Беспроводные наушники с активным шумоподавлением',
      stock: 0,
      stock_type: 'out_of_stock',
      sku: 'AIRPODSPRO',
      color: 'White',
      size: 'S',
      is_active: true,
      is_featured: true,
      sort_order: 3,
      created_at: '2023-01-03T10:00:00Z',
      updated_at: '2023-01-03T10:00:00Z'
    },
    {
      id: 4,
      name: 'Кроссовки Nike Air Max',
      price: 15999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGQjY2QiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OaWtlIEFpciBNYXg8L3RleHQ+PC9zdmc+',
      category_slug: 'shoes',
      description: 'Стильные кроссовки с технологией Air Max',
      stock: 20,
      stock_type: 'in_stock',
      sku: 'NIKEAIRMAX',
      color: 'Black',
      size: '42',
      is_active: true,
      is_featured: false,
      sort_order: 4,
      created_at: '2023-01-04T10:00:00Z',
      updated_at: '2023-01-04T10:00:00Z'
    },
    {
      id: 5,
      name: 'Джинсы Levi\'s 501',
      price: 8999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRFQ0RDNCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5MZXZpJ3MgNTAxPC90ZXh0Pjwvc3ZnPg==',
      category_slug: 'clothing',
      description: 'Классические джинсы прямого кроя',
      stock: 15,
      stock_type: 'in_stock',
      sku: 'LEVIS501',
      color: 'Blue',
      size: '32',
      is_active: true,
      is_featured: true,
      sort_order: 5,
      created_at: '2023-01-05T10:00:00Z',
      updated_at: '2023-01-05T10:00:00Z'
    },
    {
      id: 6,
      name: 'Сумка Michael Kors',
      price: 45999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzlCNTlCNiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5NaWNoYWVsIEtvcnM8L3RleHQ+PC9zdmc+',
      category_slug: 'accessories',
      description: 'Элегантная кожаная сумка для повседневного использования',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'MICHAELKORS',
      color: 'Brown',
      size: 'Medium',
      is_active: true,
      is_featured: false,
      sort_order: 6,
      created_at: '2023-01-06T10:00:00Z',
      updated_at: '2023-01-06T10:00:00Z'
    },
    {
      id: 7,
      name: 'Часы Apple Watch Series 9',
      price: 39999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGQjMzMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BcHBsZSBXYXRjaDwvdGV4dD48L3N2Zz4=',
      category_slug: 'electronics',
      description: 'Умные часы с новыми функциями здоровья',
      stock: 20,
      stock_type: 'in_stock',
      sku: 'APPLEWATCH',
      color: 'Silver',
      size: '41mm',
      is_active: true,
      is_featured: true,
      sort_order: 7,
      created_at: '2023-01-07T10:00:00Z',
      updated_at: '2023-01-07T10:00:00Z'
    },
    {
      id: 8,
      name: 'Куртка The North Face',
      price: 29999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIjJFQ0M3MSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Ob3J0aCBGYWNlPC90ZXh0Pjwvc3ZnPg==',
      category_slug: 'clothing',
      description: 'Теплая зимняя куртка с водоотталкивающим покрытием',
      stock: 15,
      stock_type: 'in_stock',
      sku: 'THENORTHFACE',
      color: 'Black',
      size: 'L',
      is_active: true,
      is_featured: false,
      sort_order: 8,
      created_at: '2023-01-08T10:00:00Z',
      updated_at: '2023-01-08T10:00:00Z'
    },
    // Добавляем больше товаров для демонстрации пагинации
    {
      id: 9,
      name: 'Планшет iPad Pro 12.9',
      price: 189999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5pUGFkIFBybzwvdGV4dD48L3N2Zz4=',
      category_slug: 'electronics',
      description: 'Мощный планшет для профессионалов с дисплеем Liquid Retina XDR',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'IPADPRO',
      color: 'Silver',
      size: '280.6 x 214.9 x 6.4 mm',
      is_active: true,
      is_featured: true,
      sort_order: 9,
      created_at: '2023-01-09T10:00:00Z',
      updated_at: '2023-01-09T10:00:00Z'
    },
    {
      id: 10,
      name: 'Игровая консоль PlayStation 5',
      price: 59999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QUzU8L3RleHQ+PC9zdmc+',
      category_slug: 'electronics',
      description: 'Новейшая игровая консоль с поддержкой 4K и ray tracing',
      stock: 5,
      stock_type: 'in_stock',
      sku: 'PLAYSTATION5',
      color: 'Black',
      size: '390 x 260 x 104 mm',
      is_active: true,
      is_featured: false,
      sort_order: 10,
      created_at: '2023-01-10T10:00:00Z',
      updated_at: '2023-01-10T10:00:00Z'
    },
    {
      id: 11,
      name: 'Беспроводные наушники Sony WH-1000XM4',
      price: 29999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzM0Qzc1OSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Tb255IFdILTEwMDBYTTQ8L3RleHQ+PC9zdmc+',
      category_slug: 'electronics',
      description: 'Лучшие в мире наушники с шумоподавлением',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'SONYWH1000XM4',
      color: 'Black',
      size: '167 x 185 x 71 mm',
      is_active: true,
      is_featured: true,
      sort_order: 11,
      created_at: '2023-01-11T10:00:00Z',
      updated_at: '2023-01-11T10:00:00Z'
    },
    {
      id: 12,
      name: 'Кроссовки Adidas Ultraboost',
      price: 18999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BZGlkYXMgVWx0cmFib29zdDwvdGV4dD48L3N2Zz4=',
      category_slug: 'shoes',
      description: 'Беговые кроссовки с технологией Boost для максимального комфорта',
      stock: 20,
      stock_type: 'in_stock',
      sku: 'ADIDASULTRABOOST',
      color: 'Black',
      size: 'EU 42',
      is_active: true,
      is_featured: false,
      sort_order: 12,
      created_at: '2023-01-12T10:00:00Z',
      updated_at: '2023-01-12T10:00:00Z'
    },
    {
      id: 13,
      name: 'Футболка Nike Dri-FIT',
      price: 3999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGQjY2QiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5OaWtlIERyaS1GSVQ8L3RleHQ+PC9zdmc+',
      category_slug: 'clothing',
      description: 'Спортивная футболка с технологией влагоотведения',
      stock: 15,
      stock_type: 'in_stock',
      sku: 'NIKEDRIFIT',
      color: 'Black',
      size: 'L',
      is_active: true,
      is_featured: false,
      sort_order: 13,
      created_at: '2023-01-13T10:00:00Z',
      updated_at: '2023-01-13T10:00:00Z'
    },
    {
      id: 14,
      name: 'Солнцезащитные очки Ray-Ban Aviator',
      price: 15999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SYXktQmFuPC90ZXh0Pjwvc3ZnPg==',
      category_slug: 'accessories',
      description: 'Классические солнцезащитные очки в стиле авиатора',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'RAYBANAVIATOR',
      color: 'Black',
      size: '58mm',
      is_active: true,
      is_featured: false,
      sort_order: 14,
      created_at: '2023-01-14T10:00:00Z',
      updated_at: '2023-01-14T10:00:00Z'
    },
    {
      id: 15,
      name: 'Рюкзак Herschel Little America',
      price: 12999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IZXJzY2hlbDwvdGV4dD48L3N2Zz4=',
      category_slug: 'accessories',
      description: 'Стильный городской рюкзак с множеством карманов',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'HERSCHEL',
      color: 'Black',
      size: '43 x 30 x 16 cm',
      is_active: true,
      is_featured: false,
      sort_order: 15,
      created_at: '2023-01-15T10:00:00Z',
      updated_at: '2023-01-15T10:00:00Z'
    },
    {
      id: 16,
      name: 'Клавиатура Logitech MX Keys',
      price: 12999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2dpdGVjaCBNWCBLZXlzPC90ZXh0Pjwvc3ZnPg==',
      category_slug: 'electronics',
      description: 'Беспроводная клавиатура с подсветкой и эргономичным дизайном',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'LOGITECHMXKEYS',
      color: 'Black',
      size: '430 x 20 x 15 mm',
      is_active: true,
      is_featured: false,
      sort_order: 16,
      created_at: '2023-01-16T10:00:00Z',
      updated_at: '2023-01-16T10:00:00Z'
    },
    {
      id: 17,
      name: 'Мышь Logitech MX Master 3',
      price: 8999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2dpdGVjaCBNWCBNYXN0ZXIgMzwvdGV4dD48L3N2Zz4=',
      category_slug: 'electronics',
      description: 'Эргономичная беспроводная мышь с точным сенсором',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'LOGITECHMXMASTER3',
      color: 'Black',
      size: '124.9 x 84.3 x 51 mm',
      is_active: true,
      is_featured: false,
      sort_order: 17,
      created_at: '2023-01-17T10:00:00Z',
      updated_at: '2023-01-17T10:00:00Z'
    },
    {
      id: 18,
      name: 'Монитор Dell UltraSharp 27"',
      price: 45999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EZWxsIFVsdHJhU2hhcnA8L3RleHQ+PC9zdmc+',
      category_slug: 'electronics',
      description: 'Профессиональный монитор с разрешением 4K и точной цветопередачей',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'DELLULTRASHARP',
      color: 'Black',
      size: '612 x 363 x 65 mm',
      is_active: true,
      is_featured: false,
      sort_order: 18,
      created_at: '2023-01-18T10:00:00Z',
      updated_at: '2023-01-18T10:00:00Z'
    },
    {
      id: 19,
      name: 'Коврик для мыши SteelSeries QcK',
      price: 1999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TdGVlbFNlcmllcyBRY0s8L3RleHQ+PC9zdmc+',
      category_slug: 'accessories',
      description: 'Профессиональный коврик для геймеров с точным отслеживанием',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'STEELSERIESQCK',
      color: 'Black',
      size: '450 x 400 x 2 mm',
      is_active: true,
      is_featured: false,
      sort_order: 19,
      created_at: '2023-01-19T10:00:00Z',
      updated_at: '2023-01-19T10:00:00Z'
    },
    {
      id: 20,
      name: 'Внешний SSD Samsung T7',
      price: 15999,
      image_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMDAwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TYW1zdW5nIFQ3PC90ZXh0Pjwvc3ZnPg==',
      category_slug: 'electronics',
      description: 'Быстрый внешний SSD с интерфейсом USB 3.2 Gen 2',
      stock: 10,
      stock_type: 'in_stock',
      sku: 'SAMSUNGT7',
      color: 'Black',
      size: '85 x 57 x 8 mm',
      is_active: true,
      is_featured: false,
      sort_order: 20,
      created_at: '2023-01-20T10:00:00Z',
      updated_at: '2023-01-20T10:00:00Z'
    }
  ];

  constructor(private http: HttpClient) {}

  // Получить все продукты с фильтрацией
  getProducts(filters: ProductFilters = {}, page: number = 1, limit: number = 10): Observable<ProductResponse> {
    // В реальном проекте здесь будет HTTP запрос
    return this.http.get<ProductResponse>(this.apiUrl, { params: this.buildParams(filters, page, limit) });
    
    // Пока используем моковые данные
    // return of(this.mockProducts).pipe(
    //   delay(this.mockDelay),
    //   map(products => this.filterProducts(products, filters)),
    //   map(filteredProducts => this.paginateProducts(filteredProducts, page, limit))
    // );
  }

  // Получить продукт по ID
  getProductById(id: number): Observable<Product | null> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
    
    // const product = this.mockProducts.find(p => p.id === id);
    // return of(product || null).pipe(delay(this.mockDelay));
  }

  // Получить категории
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
    
    // const categories = [...new Set(this.mockProducts.map(p => p.category_slug))];
    // return of(categories).pipe(delay(this.mockDelay));
  }

  // Поиск продуктов
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params: { q: query } });
    
    // const results = this.mockProducts.filter(p => 
    //   p.name.toLowerCase().includes(query.toLowerCase()) ||
    //   p.description.toLowerCase().includes(query.toLowerCase()) ||
    //   p.sku.toLowerCase().includes(query.toLowerCase())
    // );
    // return of(results).pipe(delay(this.mockDelay));
  }

  // Проверить доступность продукта
  checkProductAvailability(productId: number): Observable<boolean> {
    return this.http.get<{available: boolean}>(`${this.apiUrl}/${productId}/availability`).pipe(
      map(response => response.available)
    );
    
    // const product = this.mockProducts.find(p => p.id === productId);
    // return of(product?.stock > 0).pipe(delay(this.mockDelay));
  }

  // Получить похожие продукты
  getSimilarProducts(productId: number, limit: number = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/${productId}/similar`, { params: { limit } });
    
    // const product = this.mockProducts.find(p => p.id === productId);
    // if (!product) return of([]);
    
    // const similar = this.mockProducts
    //   .filter(p => p.id !== productId && p.category_slug === product.category_slug)
    //   .slice(0, limit);
    
    // return of(similar).pipe(delay(this.mockDelay));
  }

  // Приватные методы для фильтрации и пагинации
  private filterProducts(products: Product[], filters: ProductFilters): Product[] {
    let filtered = [...products];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search)
      );
    }

    if (filters.category_id) {
      filtered = filtered.filter(p => p.category_slug === filters.category_id);
    }

    if (filters.min_price !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.min_price!);
    }

    if (filters.max_price !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.max_price!);
    }

    // Сортировка
    if (filters.sort) {
      filtered = this.sortProducts(filtered, filters.sort, filters.order);
    }

    return filtered;
  }

  private sortProducts(products: Product[], sortBy: string, order: string = 'asc'): Product[] {
    const sorted = [...products];
    
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'created_at':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return sorted;
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
    if (filters.category_id) params = params.set('category_id', filters.category_id);
    if (filters.min_price) params = params.set('min_price', filters.min_price.toString());
    if (filters.max_price) params = params.set('max_price', filters.max_price.toString());
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.order) params = params.set('order', filters.order);

    return params;
  }
}
