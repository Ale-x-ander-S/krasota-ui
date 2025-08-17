import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginCredentials, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isLoginMode = true;
  loading = false;
  error = '';

  // Форма входа
  loginForm = {
    email: '',
    password: ''
  };

  // Форма регистрации
  registerForm = {
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Переключение между режимами входа и регистрации
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
    this.resetForms();
  }

  // Вход пользователя
  onLogin(): void {
    if (!this.validateLoginForm()) return;

    this.loading = true;
    this.error = '';

    const credentials: LoginCredentials = {
      email: this.loginForm.email,
      password: this.loginForm.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.error = this.getErrorMessage(error);
        this.loading = false;
      }
    });
  }

  // Регистрация пользователя
  onRegister(): void {
    if (!this.validateRegisterForm()) return;

    this.loading = true;
    this.error = '';

    const userData: RegisterData = {
      email: this.registerForm.email,
      password: this.registerForm.password,
      username: this.registerForm.username
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.error = '';
        // Переключаемся на режим входа после успешной регистрации
        this.isLoginMode = true;
        this.resetForms();
        this.loading = false;
      },
      error: (error) => {
        this.error = this.getErrorMessage(error);
        this.loading = false;
      }
    });
  }

  // Валидация формы входа
  private validateLoginForm(): boolean {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.error = 'Заполните все поля';
      return false;
    }
    return true;
  }

  // Валидация формы регистрации
  private validateRegisterForm(): boolean {
    if (!this.registerForm.email || !this.registerForm.password || !this.registerForm.username) {
      this.error = 'Заполните все поля';
      return false;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.error = 'Пароли не совпадают';
      return false;
    }

    if (this.registerForm.password.length < 6) {
      this.error = 'Пароль должен содержать минимум 6 символов';
      return false;
    }

    return true;
  }

  // Получение сообщения об ошибке
  private getErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'object') {
      const errorObj = error.error;
      const messages = Object.values(errorObj).filter(msg => typeof msg === 'string');
      return messages.length > 0 ? messages[0] as string : 'Произошла ошибка';
    }
    
    if (error.status === 401) {
      return 'Неверный email или пароль';
    }
    
    if (error.status === 409) {
      return 'Пользователь с таким email или именем уже существует';
    }
    
    return 'Произошла ошибка. Попробуйте еще раз.';
  }

  // Сброс форм
  private resetForms(): void {
    this.loginForm = { email: '', password: '' };
    this.registerForm = { email: '', password: '', confirmPassword: '', username: '' };
  }
}
