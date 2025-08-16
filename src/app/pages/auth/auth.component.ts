import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreement: boolean;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  showMobileMenu: boolean = false;
  isLoginMode: boolean = true;
  isSubmitting: boolean = false;
  showSuccessMessage: boolean = false;
  
  showLoginPassword: boolean = false;
  showRegisterPassword: boolean = false;
  showConfirmPassword: boolean = false;

  loginData: LoginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  registerData: RegisterData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreement: false
  };

  constructor(private router: Router) {}

  setLoginMode() {
    this.isLoginMode = true;
    this.showSuccessMessage = false;
  }

  setRegisterMode() {
    this.isLoginMode = false;
    this.showSuccessMessage = false;
  }

  toggleLoginPassword() {
    this.showLoginPassword = !this.showLoginPassword;
  }

  toggleRegisterPassword() {
    this.showRegisterPassword = !this.showRegisterPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isFormValid(): boolean {
    if (this.isLoginMode) {
      return !!this.loginData.email && !!this.loginData.password;
    } else {
      return !!this.registerData.firstName && 
             !!this.registerData.lastName && 
             !!this.registerData.email && 
             !!this.registerData.password && 
             !!this.registerData.confirmPassword && 
             this.registerData.agreement &&
             this.registerData.password === this.registerData.confirmPassword;
    }
  }

  onLogin() {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    
    // Имитация входа
    setTimeout(() => {
      console.log('Вход:', this.loginData);
      this.isSubmitting = false;
      this.showSuccessMessage = true;
      
      // Перенаправление в личный кабинет через 2 секунды
      setTimeout(() => {
        this.router.navigate(['/profile']);
      }, 2000);
    }, 1500);
  }

  onRegister() {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    
    // Имитация регистрации
    setTimeout(() => {
      console.log('Регистрация:', this.registerData);
      this.isSubmitting = false;
      this.showSuccessMessage = true;
      
      // Сброс формы
      this.registerData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreement: false
      };
    }, 1500);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  getCartItemCount(): number {
    // Имитация получения количества товаров в корзине
    return Math.floor(Math.random() * 5) + 1;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
