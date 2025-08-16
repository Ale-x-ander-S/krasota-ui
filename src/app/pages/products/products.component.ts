import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { Store, Select } from '@ngxs/store';
import { AddToCart } from '../../store/cart/cart.actions';
import { CartStateClass } from '../../store/cart';
import { Observable, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService, Product, ProductFilters, ProductResponse } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm: string = '';
  selectedCategory: string = '';
  currentSort: string = 'name-asc';
  products: Product[] = [];
  categories: string[] = [];
  loading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  totalProducts: number = 0;
  productsPerPage: number = 10;
  
  filters: ProductFilters = {};
  
  @Select(CartStateClass.getItemCount) itemCount$!: Observable<number>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private store: Store,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    
    // Настройка поиска с debounce
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch() {
    // Создаем Observable для поиска с debounce
    const search$ = new Subject<string>();
    
    search$.pipe(
      debounceTime(300), // Ждем 300мс после остановки печати
      distinctUntilChanged(), // Игнорируем повторяющиеся значения
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.filterProducts();
    });

    // Подписываемся на изменения поиска
    this.searchTerm = '';
  }

  loadProducts() {
    this.loading = true;
    this.error = null;

    this.productService.getProducts(this.filters, this.currentPage, this.productsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ProductResponse) => {
          this.products = response.products;
          this.totalProducts = response.total;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Ошибка загрузки товаров';
          this.loading = false;
          console.error('Error loading products:', error);
        }
      });
  }

  private loadCategories() {
    this.productService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  filterProducts() {
    this.currentPage = 1;
    this.filters = {
      search: this.searchTerm || undefined,
      category_id: this.selectedCategory || undefined,
      sort: this.filters.sort,
      order: this.filters.order
    };
    this.loadProducts();
  }

  onSearchChange() {
    this.filterProducts();
  }

  onCategoryChange() {
    this.filterProducts();
  }

  onSortChange(sortBy: string) {
    this.currentSort = sortBy;
    
    // Парсим параметры сортировки
    let sort: 'name' | 'price' | 'created_at' = 'name';
    let order: 'asc' | 'desc' = 'asc';
    
    switch (sortBy) {
      case 'price-asc':
        sort = 'price';
        order = 'asc';
        break;
      case 'price-desc':
        sort = 'price';
        order = 'desc';
        break;
      case 'name-asc':
        sort = 'name';
        order = 'asc';
        break;
      case 'name-desc':
        sort = 'name';
        order = 'desc';
        break;
      case 'newest':
        sort = 'created_at';
        order = 'desc';
        break;
      case 'oldest':
        sort = 'created_at';
        order = 'asc';
        break;
      default:
        sort = 'name';
        order = 'asc';
    }
    
    this.filters = { ...this.filters, sort, order };
    this.filterProducts();
  }

  onSortChangeEvent(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.onSortChange(target.value);
  }

  toggleViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  goToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  addToCart(event: Event, product: Product) {
    event.stopPropagation();
    
    if (product.stock === 0) return;
    
    this.store.dispatch(new AddToCart(product));
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  // Методы для пагинации
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.productsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 7; // Показываем максимум 7 страниц
    
    if (this.totalPages <= maxVisiblePages) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Если страниц много, показываем умно
      const leftSide = Math.floor(maxVisiblePages / 2);
      const rightSide = maxVisiblePages - leftSide - 1;
      
      let startPage = Math.max(1, this.currentPage - leftSide);
      let endPage = Math.min(this.totalPages, this.currentPage + rightSide);
      
      // Корректируем границы
      if (endPage - startPage + 1 < maxVisiblePages) {
        if (startPage === 1) {
          endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
        } else {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  get pageInfo(): string {
    const start = (this.currentPage - 1) * this.productsPerPage + 1;
    const end = Math.min(this.currentPage * this.productsPerPage, this.totalProducts);
    return `Показано ${start}-${end} из ${this.totalProducts} товаров`;
  }

  onPriceFilterChange() {
    // Получаем значения из полей ввода
    const minPriceInput = document.getElementById('min-price') as HTMLInputElement;
    const maxPriceInput = document.getElementById('max-price') as HTMLInputElement;
    
    const minPrice = minPriceInput?.value ? Number(minPriceInput.value) : undefined;
    const maxPrice = maxPriceInput?.value ? Number(maxPriceInput.value) : undefined;
    
    this.filters = { 
      ...this.filters, 
      min_price: minPrice,
      max_price: maxPrice
    };
    
    this.filterProducts();
  }
}
