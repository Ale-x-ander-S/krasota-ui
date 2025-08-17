import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import { CartStateClass } from '../../store/cart';
import { Observable } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  showMobileMenu: boolean = false;
  currentRoute: string = '';
  
  @Select(CartStateClass.getItemCount) itemCount$!: Observable<number>;
  
  // Аутентификация
  currentUser$ = this.authService.currentUser$;
  isAuthenticated$ = this.authService.isAuthenticated$;

  constructor(
    private router: Router,
    private store: Store,
    private authService: AuthService
  ) {}

  get itemCount(): number {
    return this.store.selectSnapshot(CartStateClass.getItemCount) || 0;
  }

  ngOnInit() {
    // Отслеживаем изменения маршрута для подсветки активной ссылки
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
    });
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }

  goToCart() {
    this.router.navigate(['/cart']);
    this.closeMobileMenu();
  }

  reloadPage() {
    // Перезагружаем текущую страницу
    window.location.reload();
  }

  // Аутентификация
  login() {
    this.router.navigate(['/auth']);
    this.closeMobileMenu();
  }

  logout() {
    this.authService.logout();
    this.closeMobileMenu();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.closeMobileMenu();
  }
}
