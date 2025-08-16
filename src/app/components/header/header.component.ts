import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Store, Select } from '@ngxs/store';
import { CartStateClass } from '../../store/cart';
import { Observable } from 'rxjs';

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

  constructor(
    private router: Router,
    private store: Store
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
}
