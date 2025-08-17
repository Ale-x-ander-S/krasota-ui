import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

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

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://45.12.229.112:8080/api/v1/auth';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  // Вход пользователя
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setAuth(response.token, response.user);
      })
    );
  }

  // Регистрация пользователя
  register(userData: RegisterData): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData).pipe(
      tap(user => {
        // После регистрации автоматически входим
        // Можно убрать, если не нужно автоматически входить
        console.log('Пользователь зарегистрирован:', user);
      })
    );
  }

  // Выход пользователя
  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth']);
  }

  // Проверить, аутентифицирован ли пользователь
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Получить текущего пользователя
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Получить токен
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Проверить, истек ли токен
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  // Получить профиль текущего пользователя
  getProfile(): Observable<User> {
    const token = this.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<User>('http://45.12.229.112:8080/api/v1/users/me', { headers });
  }

  // Обновить профиль текущего пользователя
  updateProfile(profileData: Partial<User>): Observable<User> {
    const token = this.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put<User>('http://45.12.229.112:8080/api/v1/users/me', profileData, { headers }).pipe(
      tap(updatedUser => {
        // Обновляем локальные данные пользователя
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
      })
    );
  }

  // Обновить статус email пользователя
  updateEmailStatus(isEmailActive: boolean): Observable<any> {
    const token = this.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    const body = { is_email_active: isEmailActive };
    return this.http.put<any>('http://45.12.229.112:8080/api/v1/users/me/email-status', body, { headers }).pipe(
      tap(() => {
        // Обновляем локальные данные пользователя
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          currentUser.is_email_active = isEmailActive;
          this.currentUserSubject.next(currentUser);
          localStorage.setItem(this.userKey, JSON.stringify(currentUser));
        }
      })
    );
  }

  // Получить информацию из токена
  getTokenInfo(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // Получить роль пользователя из токена
  getRoleFromToken(): string | null {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo?.role || tokenInfo?.user_role || null;
  }

  // Получить ID пользователя из токена
  getUserIdFromToken(): number | null {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo?.sub || tokenInfo?.user_id || tokenInfo?.id || null;
  }

  // Обновить токен (если есть эндпоинт для обновления)
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, {}).pipe(
      tap(response => {
        this.setAuth(response.token, response.user);
      })
    );
  }

  // Приватные методы
  private setAuth(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    
    if (token && userStr && !this.isTokenExpired()) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
        this.clearAuth();
      }
    } else {
      this.clearAuth();
    }
  }
}
