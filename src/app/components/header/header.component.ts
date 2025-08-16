import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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

  constructor(private router: Router) {}

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
}
