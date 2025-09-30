import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
    private cartAnimationService: CartAnimationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Прокручиваем страницу вверх при инициализации
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
    
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
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => window.scrollTo(0, 0), 0);
      }
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

    this.productService.getProducts(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ProductListResponse) => {
          this.products = response.products || [];
          this.totalProducts = response.total || 0;
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
    
    // Обновляем фильтры
    this.filters = {
      search: this.searchTerm || undefined,
      category_id: this.selectedCategory || undefined,
      min_price: undefined,
      max_price: undefined,
      sort: 'created_at',
      order: 'desc'
    };
    
    // Загружаем товары с обновленными фильтрами
    this.loadProducts();
  }

  onSearchChange() {
    this.filterProducts();
  }

  onCategoryChange() {
    this.filterProducts();
  }

  // Плавная прокрутка вверх
  private scrollToTop() {
    setTimeout(() => {
      const productsSection = document.querySelector('.products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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

  private touchStartTime = 0;
  private touchMoved = false;
  private touchStartY = 0;
  private touchStartX = 0;
  private touchThreshold = 15; // Увеличиваем порог для более точного определения скролла
  
  // Переменные для кнопки
  private buttonTouchStartTime = 0;
  private buttonTouchMoved = false;
  private buttonTouchStartY = 0;
  private buttonTouchStartX = 0;

  onProductTouchStart(event: TouchEvent) {
    this.touchStartTime = Date.now();
    this.touchMoved = false;
    this.touchStartY = event.touches[0].clientY;
    this.touchStartX = event.touches[0].clientX;
  }

  onProductTouchMove(event: TouchEvent) {
    const currentY = event.touches[0].clientY;
    const currentX = event.touches[0].clientX;
    const deltaY = Math.abs(currentY - this.touchStartY);
    const deltaX = Math.abs(currentX - this.touchStartX);
    
    // Если пользователь сдвинул палец больше чем на threshold пикселей, считаем это scroll
    if (deltaY > this.touchThreshold || deltaX > this.touchThreshold) {
      this.touchMoved = true;
    }
  }

  onProductTouchEnd(event: TouchEvent, productId: number) {
    // Проверяем что это был tap, а не scroll
    const touchDuration = Date.now() - this.touchStartTime;
    
    // Более строгие условия для определения тапа
    if (touchDuration < 300 && !this.touchMoved && touchDuration > 50) {
      event.preventDefault();
      event.stopPropagation();
      this.goToProduct(productId);
    }
  }

  onProductClick(event: MouseEvent, productId: number) {
    // На мобильных устройствах используем только touch события
    if ('ontouchstart' in window) {
      event.preventDefault();
      return;
    }
    
    this.goToProduct(productId);
  }

  // Методы для обработки touch событий кнопки
  onButtonTouchStart(event: TouchEvent) {
    this.buttonTouchStartTime = Date.now();
    this.buttonTouchMoved = false;
    this.buttonTouchStartY = event.touches[0].clientY;
    this.buttonTouchStartX = event.touches[0].clientX;
  }

  onButtonTouchMove(event: TouchEvent) {
    const currentY = event.touches[0].clientY;
    const currentX = event.touches[0].clientX;
    const deltaY = Math.abs(currentY - this.buttonTouchStartY);
    const deltaX = Math.abs(currentX - this.buttonTouchStartX);
    
    // Если пользователь сдвинул палец больше чем на threshold пикселей, считаем это scroll
    if (deltaY > this.touchThreshold || deltaX > this.touchThreshold) {
      this.buttonTouchMoved = true;
    }
  }

  onButtonTouchEnd(event: TouchEvent, product: Product) {
    // Проверяем что это был tap, а не scroll
    const touchDuration = Date.now() - this.buttonTouchStartTime;
    
    // Более строгие условия для определения тапа на кнопке
    if (touchDuration < 300 && !this.buttonTouchMoved && touchDuration > 50) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.addToCart(event, product);
    }
  }

  goToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  addToCart(event: Event, product: Product) {
    // Останавливаем всплытие события
    event.stopPropagation();
    event.preventDefault();
    
    // Для touch событий дополнительно останавливаем всплытие
    if (event.type === 'touchend') {
      event.stopImmediatePropagation();
    }
    
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
