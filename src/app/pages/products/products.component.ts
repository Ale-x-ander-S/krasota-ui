import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { Store, Select } from '@ngxs/store';
import { AddToCart } from '../../store/cart/cart.actions';
import { CartStateClass } from '../../store/cart';
import { CartItem } from '../../models/cart.model';
import { CartAnimationService } from '../../services/cart-animation.service';
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
  productsPerPage: number = 12;
  
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
    private categoryService: CategoryService,
    private cartAnimationService: CartAnimationService
  ) {}

  ngOnInit() {
    // Прокручиваем страницу вверх при инициализации
    window.scrollTo(0, 0);
    
    // Обрабатываем query params при переходе из категорий
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      console.log('Query params получены:', params);
      
      if (params['category_id']) {
        this.selectedCategory = params['category_id'];
        console.log('Установлена категория:', this.selectedCategory);
        // Обновляем фильтры и загружаем товары с фильтрацией
        this.filterProducts();
      } else {
        // Если параметр категории отсутствует, сбрасываем фильтр и загружаем все товары
        this.selectedCategory = '';
        console.log('Сброшена категория, загружаем все товары');
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
    console.log('Текущие фильтры:', this.filters);
    console.log('Выбранная категория:', this.selectedCategory);

    this.productService.getProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ProductListResponse) => {
          console.log('Ответ от сервера:', response);
          this.products = response.products || [];
          this.totalProducts = response.total || 0;
          this.loading = false;
          
          console.log('Загружено товаров:', this.products.length);
          console.log('Общее количество:', this.totalProducts);
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
    
    // Обновляем фильтры
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
      searchTerm: this.searchTerm,
      filters: this.filters
    });
    
    // Загружаем товары с обновленными фильтрами
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
    
    // Создаем CartItem с правильной структурой
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || 'assets/images/placeholder.svg',
      category_id: product.category_id,
      category_name: this.getCategoryName(product.category_id.toString()),
      quantity: 1,
      description: product.description,
      stock: product.stock,
      stock_type: product.stock_type,
      sku: product.sku,
      color: product.color,
      size: product.size
    };
    
    // Запускаем анимацию
    this.playAddToCartAnimation(event, product);
    
    // Добавляем товар в корзину
    this.store.dispatch(new AddToCart(cartItem));
  }

  private playAddToCartAnimation(event: Event, product: Product): void {
    // Получаем элемент карточки товара
    const productCard = (event.target as HTMLElement).closest('.product-card') as HTMLElement;
    if (!productCard) return;
    
    // Получаем элемент корзины в хедере
    const cartElement = document.querySelector('.cart-icon') as HTMLElement;
    if (!cartElement) return;
    
    // Запускаем анимацию
    this.cartAnimationService.animateAddToCart(productCard, cartElement);
    
    // Анимация пульсации корзины
    setTimeout(() => {
      this.cartAnimationService.animateCartPulse(cartElement);
    }, 400);
    
    // Анимация счетчика
    setTimeout(() => {
      const countElement = cartElement.querySelector('.cart-count');
      if (countElement) {
        this.cartAnimationService.animateCountChange(countElement as HTMLElement);
      }
    }, 600);
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

  // Проверяем, активны ли фильтры или поиск
  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategory || this.filters.search || this.filters.category_id);
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
