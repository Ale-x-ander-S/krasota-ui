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
