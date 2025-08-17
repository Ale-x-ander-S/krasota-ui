import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_slug?: string;
  image_url: string;
  stock: number;
  stock_type: string;
  color?: string;
  size?: string;
  sku: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url: string;
  stock: number;
  stock_type: string;
  color?: string;
  size?: string;
  sku: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://45.12.229.112:8080/api/v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Получить список товаров с фильтрацией и пагинацией
  getProducts(params: {
    page?: number;
    limit?: number;
    category_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
  } = {}): Observable<ProductListResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.category_id) httpParams = httpParams.set('category_id', params.category_id);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.min_price) httpParams = httpParams.set('min_price', params.min_price.toString());
    if (params.max_price) httpParams = httpParams.set('max_price', params.max_price.toString());

    return this.http.get<ProductListResponse>(`${this.apiUrl}/products`, { 
      headers: this.getHeaders(),
      params: httpParams
    });
  }

  // Получить товар по ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }

  // Создать новый товар
  createProduct(productData: CreateProductData): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, productData, { headers: this.getHeaders() });
  }

  // Обновить товар
  updateProduct(id: number, productData: Partial<CreateProductData>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, productData, { headers: this.getHeaders() });
  }

  // Удалить товар
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`, { headers: this.getHeaders() });
  }
}
