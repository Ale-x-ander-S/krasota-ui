import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  address?: string;
  phone?: string;
  is_email_active: boolean;
  favorites?: any;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/v1';

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

  // Получить всех пользователей (только для админов)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  // Получить пользователя по ID
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() });
  }

  // Обновить роль пользователя
  updateUserRole(userId: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, { role }, { headers: this.getHeaders() });
  }

  // Обновить пользователя (полное обновление)
  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData, { headers: this.getHeaders() });
  }

  // Удалить пользователя
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, { headers: this.getHeaders() });
  }
}
