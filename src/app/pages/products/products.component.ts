import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { Store, Select } from '@ngxs/store';
import { AddToCart } from '../../store/cart/cart.actions';
import { CartStateClass } from '../../store/cart';
import { Observable, Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService, Product, ProductListResponse } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';

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

  products: Product[] = [];
  categories: Category[] = [];
  loading: boolean = false;
  error: string | null = null;
  categoriesLoading: boolean = false;
  currentPage: number = 1;
  totalProducts: number = 0;
  productsPerPage: number = 10;
  
  filters = {
    search: undefined as string | undefined,
    category_id: undefined as string | undefined,
    min_price: undefined as number | undefined,
    max_price: undefined as number | undefined,
    sort: 'created_at',
    order: 'desc'
  };
  
  @Select(CartStateClass.getItemCount) itemCount$!: Observable<number>;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    // Прокручиваем страницу вверх при инициализации
    window.scrollTo(0, 0);
    
    // Обрабатываем query params при переходе из категорий
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category_id']) {
        this.selectedCategory = params['category_id'];
        // Обновляем фильтры и загружаем товары с фильтрацией
        this.filterProducts();
      } else {
        // Если параметр категории отсутствует, сбрасываем фильтр и загружаем все товары
        this.selectedCategory = '';
        this.loadProducts();
      }
      
      // Загружаем категории в любом случае
      this.loadCategories();
      
      // Прокручиваем вверх при изменении query params
      setTimeout(() => window.scrollTo(0, 0), 0);
    });
    
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

    const params = {
      page: this.currentPage,
      limit: this.productsPerPage,
      ...this.filters
    };

    console.log('Загрузка товаров с параметрами:', params);

    this.productService.getProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ProductListResponse) => {
          this.products = response.products;
          this.totalProducts = response.total;
          this.loading = false;
        },
        error: (error: any) => {
          this.error = 'Ошибка загрузки товаров';
          this.loading = false;
          console.error('Error loading products:', error);
        }
      });
  }

  private loadCategories() {
    this.categoriesLoading = true;

    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: Category[]) => {
          this.categories = categories.filter(cat => cat.is_active); // Показываем только активные категории
          this.categoriesLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading categories:', error);
          this.categories = [];
          this.categoriesLoading = false;
        }
      });
  }

  filterProducts() {
    this.currentPage = 1;
    this.filters = {
      search: this.searchTerm || undefined,
      category_id: this.selectedCategory || undefined,
      min_price: undefined,
      max_price: undefined,
      sort: 'created_at',
      order: 'desc'
    };
    
    console.log('Фильтрация товаров:', {
      selectedCategory: this.selectedCategory,
      filters: this.filters
    });
    
    this.loadProducts();
  }

  onSearchChange() {
    this.filterProducts();
    this.scrollToTop();
  }

  onCategoryChange() {
    this.filterProducts();
    this.scrollToTop();
  }

  // Плавная прокрутка вверх
  private scrollToTop() {
    setTimeout(() => {
      const productsSection = document.querySelector('.products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  // Очистить все фильтры
  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.currentPage = 1;
    
    // Очищаем URL от query параметров
    this.router.navigate(['/products'], { 
      queryParams: {},
      replaceUrl: true 
    });
    
    // Загружаем все товары без фильтров
    this.loadProducts();
  }

  // Переход к странице категорий
  goToCategories() {
    this.router.navigate(['/categories']);
  }



  toggleViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  goToProduct(productId: number) {
    console.log('Переход к товару с ID:', productId);
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
    this.scrollToTop();
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

  // Получить название категории по ID
  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id.toString() === categoryId);
    return category ? category.name : 'Неизвестная категория';
  }

  // Обработчик ошибки загрузки изображения
  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.svg';
  }
}
