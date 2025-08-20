import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { CategoryService, Category } from '../../services/category.service';
import { ProductService, Product } from '../../services/product.service';
import { CartAnimationService } from '../../services/cart-animation.service';

// Используем интерфейсы из сервисов: Category из CategoryService, Product из ProductService

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  showMobileMenu: boolean = false;
  categories: Category[] = [];
  products: Product[] = [];
  selectedCategory: string = '';
  searchTerm: string = '';
  
  // Состояния загрузки
  categoriesLoading: boolean = false;
  categoriesError: string = '';
  productsLoading: boolean = false;
  productsError: string = '';

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private productService: ProductService,
    private cartAnimationService: CartAnimationService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoriesLoading = true;
    this.categoriesError = '';

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(cat => cat.is_active); // Показываем только активные категории
        this.categoriesLoading = false;
        console.log('Категории загружены:', categories);
      },
      error: (error) => {
        this.categoriesError = 'Ошибка загрузки категорий: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        this.categoriesLoading = false;
        console.error('Ошибка загрузки категорий:', error);
      }
    });
  }

  loadProducts() {
    this.productsLoading = true;
    this.productsError = '';

    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.products;
        this.productsLoading = false;
        console.log('Товары загружены:', response);
      },
      error: (error) => {
        this.productsError = 'Ошибка загрузки товаров: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        this.productsLoading = false;
        console.error('Ошибка загрузки товаров:', error);
      }
    });
  }

  getTotalProducts(): number {
    return this.products.length;
  }

  getTotalInStock(): number {
    return this.products.filter(p => p.stock > 0).length;
  }

  // Получаем количество товаров в категории
  getCategoryProductCount(categoryId: number): number {
    return this.products.filter(p => p.category_id === categoryId).length;
  }

  // Получаем товары для конкретной категории
  getCategoryProducts(categoryId: number): Product[] {
    return this.products.filter(p => p.category_id === categoryId);
  }

  // Метод для получения иконки категории (заглушка - в реальной версии это может быть в API)
  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'Электроника': '📱',
      'Одежда': '👕', 
      'Обувь': '👟',
      'Аксессуары': '👜',
      'Красота': '💄',
      'Косметика': '💄',
      'Уход': '🧴',
      'Парфюмерия': '🌸'
    };
    return icons[categoryName] || '📦';
  }

  getFilteredCategories(): Category[] {
    let filtered = this.categories;

    if (this.selectedCategory) {
      filtered = filtered.filter(cat => cat.name === this.selectedCategory);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }

  getFilteredProducts(category: Category): Product[] {
    let categoryProducts = this.getCategoryProducts(category.id);
    
    if (!this.searchTerm) return categoryProducts.slice(0, 3); // Показываем только 3 товара для превью
    
    return categoryProducts.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    ).slice(0, 3);
  }

  onCategoryChange() {
    // Логика фильтрации по категории
  }

  onSearchChange() {
    // Логика поиска
  }

  clearFilters() {
    this.selectedCategory = '';
    this.searchTerm = '';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  // Проверяем, есть ли товар в наличии
  isProductInStock(product: Product): boolean {
    return product.stock > 0;
  }

  // Обработчик ошибки загрузки изображения
  onImageError(event: any): void {
    event.target.src = 'assets/images/placeholder.svg';
  }

  goToProduct(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  // Переход к товарам конкретной категории
  goToCategoryProducts(categoryId: number, categoryName: string) {
    this.router.navigate(['/products'], { 
      queryParams: { 
        category_id: categoryId,
        category_name: categoryName 
      } 
    });
  }

  getCartItemCount(): number {
    // Имитация получения количества товаров в корзине
    return Math.floor(Math.random() * 5) + 1;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}
