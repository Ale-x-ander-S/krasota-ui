import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Добавляем токен к запросам, кроме аутентификации
  if (!isAuthRequest(request)) {
    const token = authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Токен истек или недействителен
        authService.logout();
        router.navigate(['/auth']);
      }
      return throwError(() => error);
    })
  );
};

function isAuthRequest(request: any): boolean {
  return request.url.includes('/auth/');
}
