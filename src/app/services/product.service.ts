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
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
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
  private readonly apiUrl = 'http://45.12.229.112:8080/api/v1/products';

  constructor(private http: HttpClient) {}

  // Получить все продукты с фильтрацией
  getProducts(filters: ProductFilters = {}, page: number = 1, limit: number = 10): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(this.apiUrl, { params: this.buildParams(filters, page, limit) });
  }

  // Получить продукт по ID
  getProductById(id: number): Observable<Product | null> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Получить категории
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  // Поиск продуктов
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params: { q: query } });
  }

  // Проверить доступность продукта
  checkProductAvailability(productId: number): Observable<boolean> {
    return this.http.get<{available: boolean}>(`${this.apiUrl}/${productId}/availability`).pipe(
      map(response => response.available)
    );
  }

  // Получить похожие продукты
  getSimilarProducts(productId: number, limit: number = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/${productId}/similar`, { params: { limit } });
  }

  // // Приватные методы для фильтрации и пагинации
  // private filterProducts(products: Product[], filters: ProductFilters): Product[] {
  //   let filtered = [...products];

  //   if (filters.search) {
  //     const search = filters.search.toLowerCase();
  //     filtered = filtered.filter(p => 
  //       p.name.toLowerCase().includes(search) ||
  //       p.description.toLowerCase().includes(search) ||
  //       p.sku.toLowerCase().includes(search)
  //     );
  //   }

  //   if (filters.category_id) {
  //     filtered = filtered.filter(p => p.category_slug === filters.category_id);
  //   }

  //   if (filters.min_price !== undefined) {
  //     filtered = filtered.filter(p => p.price >= filters.min_price!);
  //   }

  //   if (filters.max_price !== undefined) {
  //     filtered = filtered.filter(p => p.price <= filters.max_price!);
  //   }

  //   return filtered;
  // }

  // private paginateProducts(products: Product[], page: number, limit: number): ProductResponse {
  //   const start = (page - 1) * limit;
  //   const end = start + limit;
  //   const paginatedProducts = products.slice(start, end);

  //   return {
  //     products: paginatedProducts,
  //     total: products.length,
  //     page,
  //     limit
  //   };
  // }

  private buildParams(filters: ProductFilters, page: number, limit: number): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.search) params = params.set('search', filters.search);
    if (filters.category_id) params = params.set('category_id', filters.category_id);
    if (filters.min_price) params = params.set('min_price', filters.min_price.toString());
    if (filters.max_price) params = params.set('max_price', filters.max_price.toString());

    return params;
  }
}
