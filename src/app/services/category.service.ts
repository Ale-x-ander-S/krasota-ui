import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'https://45.12.229.112:8080/api/v1';

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

  // Получить список всех категорий
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, { 
      headers: this.getHeaders() 
    });
  }

  // Получить категорию по ID
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`, { 
      headers: this.getHeaders() 
    });
  }

  // Создать новую категорию
  createCategory(categoryData: CreateCategoryData): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, categoryData, { 
      headers: this.getHeaders() 
    });
  }

  // Обновить категорию
  updateCategory(id: number, categoryData: UpdateCategoryData): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, categoryData, { 
      headers: this.getHeaders() 
    });
  }

  // Удалить категорию
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, { 
      headers: this.getHeaders() 
    });
  }
}
