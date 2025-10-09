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
        this.categories = categories; // Показываем все категории
        this.categoriesLoading = false;
      },
      error: (error) => {
        this.categoriesError = 'Ошибка загрузки категорий: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        this.categoriesLoading = false;
      }
    });
  }

  loadProducts() {
    this.productsLoading = true;
    this.productsError = '';

    // Загружаем ВСЕ товары для поиска по категориям
    this.productService.getProducts({ limit: 10000 }).subscribe({
      next: (response) => {
        this.products = response.products;
        this.productsLoading = false;
      },
      error: (error) => {
        this.productsError = 'Ошибка загрузки товаров: ' + (error.error?.message || error.message || 'Неизвестная ошибка');
        this.productsLoading = false;
      }
    });
  }


  // Получаем количество товаров в категории
  getCategoryProductCount(category: Category): number {
    // Используем product_count из API, если он есть, иначе считаем по товарам
    if (category.product_count !== undefined && category.product_count !== null) {
      return category.product_count;
    }
    return this.products.filter(p => p.category_id === category.id).length;
  }

  // Получаем товары для конкретной категории
  getCategoryProducts(categoryId: number): Product[] {
    return this.products.filter(p => p.category_id === categoryId);
  }

  // Получаем изображение категории
  getCategoryImage(category: Category): string {
    // Проверяем различные возможные поля изображения
    if (category.image_url) {
      return category.image_url;
    }
    
    // Если изображение не найдено, используем стандартные пути
    const standardPaths = [
      `assets/images/categories/category_${category.id}.jpg`,
      `assets/images/categories/category_${category.id}.png`,
      `assets/images/categories/category_${category.id}.webp`,
      `http://45.12.229.112:8080/images/categories/${category.id}.jpg`,
      `http://45.12.229.112:8080/images/categories/${category.id}.png`,
      `http://45.12.229.112:8080/images/categories/${category.id}.webp`
    ];
    
    return standardPaths[0];
  }

  // Обработка ошибок загрузки изображений
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/placeholder.svg';
    }
  }

  getFilteredCategories(): Category[] {
    let filtered = this.categories;

    if (this.selectedCategory) {
      filtered = filtered.filter(cat => cat.name === this.selectedCategory);
    }

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      
      filtered = filtered.filter(cat => {
        // Поиск по названию и описанию категории
        const matchesCategory = cat.name.toLowerCase().includes(searchLower) ||
                               (cat.description && cat.description.toLowerCase().includes(searchLower));
        
        // Поиск по товарам внутри категории
        const matchesProducts = this.getCategoryProducts(cat.id).some(product =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description && product.description.toLowerCase().includes(searchLower))
        );
        
        return matchesCategory || matchesProducts;
      });
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

  // Получаем найденные товары для конкретной категории
  getSearchedProductsForCategory(category: Category): Product[] {
    if (!this.searchTerm) {
      return [];
    }

    const searchLower = this.searchTerm.toLowerCase();
    const categoryProducts = this.getCategoryProducts(category.id);
    
    return categoryProducts.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower))
    );
  }

  // Метод для экранирования HTML
  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Генерация и скачивание прайс-листа
  downloadPriceList() {
    if (this.products.length === 0) {
      alert('Нет товаров для скачивания');
      return;
    }

    // Создаем CSV контент
    let csvContent = '\uFEFF'; // BOM для корректной кодировки UTF-8 в Excel
    
    // Заголовок компании
    csvContent += 'Krasota72 - Интернет-магазин товаров\n';
    csvContent += 'Дата формирования: ' + new Date().toLocaleDateString('ru-RU') + '\n';
    csvContent += 'Телефон: +7 (912) 999-37-66\n';
    csvContent += 'Email: krasota72tmn@gmail.com\n';
    csvContent += 'Адрес: г. Тюмень, ул. Республики, 249/8\n';
    csvContent += 'Режим работы: Пн-Пт: 9:00-18:00, Сб: 10:00-16:00\n';
    csvContent += 'VK: https://vk.com/tyumenkrasota72\n';
    csvContent += 'Telegram: https://t.me/krasota72ru\n';
    csvContent += '\n';
    
    // Заголовки таблицы
    csvContent += 'Категория;Название товара;Артикул;Цена (₽);Цвет;Размер;Количество в упаковке;Описание\n';
    
    // Сортируем категории по имени
    const sortedCategories = [...this.categories].sort((a, b) => 
      a.name.localeCompare(b.name, 'ru')
    );
    
    // Группируем товары по категориям
    sortedCategories.forEach(category => {
      const categoryProducts = this.getCategoryProducts(category.id);
      
      if (categoryProducts.length > 0) {
        // Добавляем заголовок категории
        csvContent += `"=== ${category.name} ===";"";"";"";"";"";"";""\n`;
        
        // Сортируем товары внутри категории по названию
        const sortedProducts = categoryProducts.sort((a, b) => 
          a.name.localeCompare(b.name, 'ru')
        );
        
        sortedProducts.forEach(product => {
          // Формируем информацию о количестве в упаковке
          let packageInfo = '';
          if (product.package_quantity && product.package_quantity > 0) {
            const packageType = product.package_quantity_type || 'шт';
            packageInfo = `${product.package_quantity} ${packageType}`;
          } else {
            packageInfo = product.stock_type || '';
          }

          // Получаем описание без обрезания
          let description = product.description || '';

          // Правильно определяем цвет
          let color = '';
          if (product.color && 
              (product.color.toLowerCase().includes('белый') || 
               product.color.toLowerCase().includes('черный') ||
               product.color.toLowerCase().includes('красный') ||
               product.color.toLowerCase().includes('синий') ||
               product.color.toLowerCase().includes('зеленый') ||
               product.color.toLowerCase().includes('желтый') ||
               product.color.toLowerCase().includes('розовый') ||
               product.color.toLowerCase().includes('серый'))) {
            color = product.color;
          }

          const row = [
            '', // Пустая ячейка под категорией
            product.name.replace(/;/g, ','),
            (product.sku || '').replace(/;/g, ','),
            product.price.toString(),
            color.replace(/;/g, ','),
            (product.size || '').replace(/;/g, ','),
            packageInfo.replace(/;/g, ','),
            description.replace(/;/g, ',').replace(/\n/g, ' ').replace(/\r/g, ' ')
          ];
          
          csvContent += row.join(';') + '\n';
        });
        
        // Добавляем пустую строку между категориями
        csvContent += '"";"";"";"";"";"";"";""\n';
      }
    });
    
    // Создаем blob и скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `price_list_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Генерация расширенного прайс-листа в формате Excel (HTML таблица)
  downloadPriceListExcel() {
    if (this.products.length === 0) {
      alert('Нет товаров для скачивания');
      return;
    }

    // Создаем HTML таблицу для Excel
    let htmlContent = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
    htmlContent += '<head>';
    htmlContent += '<meta charset="UTF-8">';
    htmlContent += '<style>';
    htmlContent += 'body { font-family: Arial, sans-serif; margin: 20px; }';
    htmlContent += 'table { border-collapse: collapse; width: 100%; margin-bottom: 20px; table-layout: fixed; }';
    htmlContent += 'th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; }';
    htmlContent += 'th { background-color: #4CAF50; color: white; font-weight: bold; }';
    htmlContent += '.category-header { background-color: #E8F5E9; font-weight: bold; font-size: 14px; }';
    htmlContent += '.category-title { background-color: #2E7D32; color: white; font-weight: bold; text-align: center; font-size: 16px; }';
    htmlContent += '.company-header { text-align: center; margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; }';
    htmlContent += '.company-logo { margin-bottom: 15px; }';
    htmlContent += '.contact-info { font-size: 13px; color: #333; line-height: 1.6; }';
    htmlContent += '.contact-row { margin: 5px 0; }';
    htmlContent += '.col-num { width: 40px; text-align: center; }';
    htmlContent += '.col-name { width: 200px; word-wrap: break-word; overflow-wrap: break-word; }';
    htmlContent += '.col-sku { width: 100px; word-wrap: break-word; }';
    htmlContent += '.col-price { width: 80px; text-align: right; }';
    htmlContent += '.col-color { width: 80px; word-wrap: break-word; }';
    htmlContent += '.col-size { width: 80px; word-wrap: break-word; }';
    htmlContent += '.col-package { width: 100px; word-wrap: break-word; }';
    htmlContent += '.col-description { width: 300px; max-width: 300px; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap; hyphens: auto; }';
    htmlContent += '</style>';
    htmlContent += '</head>';
    htmlContent += '<body>';
    
    // Заголовок компании с логотипом
    htmlContent += '<div class="company-header">';
    htmlContent += '<div class="company-logo">';
    htmlContent += '<img src="assets/images/lotus.png" alt="Krasota72" style="height: 40px; width: auto; margin-right: 10px; vertical-align: middle;" />';
    htmlContent += '<span style="font-size: 28px; font-weight: bold; color: #059669; vertical-align: middle;">Krasota72</span>';
    htmlContent += '</div>';
    htmlContent += '<div class="contact-info">';
    htmlContent += '<div class="contact-row"><strong>Интернет-магазин товаров</strong></div>';
    htmlContent += '<div class="contact-row">📞 Телефон: +7 (912) 999-37-66</div>';
    htmlContent += '<div class="contact-row">📧 Email: krasota72tmn@gmail.com</div>';
    htmlContent += '<div class="contact-row">📍 Адрес: г. Тюмень, ул. Республики, 249/8</div>';
    htmlContent += '<div class="contact-row">🕒 Режим работы: Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</div>';
    htmlContent += '<div class="contact-row">';
    htmlContent += '<svg width="16" height="16" viewBox="0 0 24 24" fill="#4c75a3" style="vertical-align: middle; margin-right: 5px;">';
    htmlContent += '<path d="M12.785 16.241s.327-.039.495-.186c.151-.133.146-.382.146-.382s-.021-1.305.653-1.496c.667-.186.1.526 3.006 2.971 2.133 1.906 2.373 1.515 2.373 1.515h2.938s1.219-.076.641-1.022c-.048-.077-.346-.729-1.781-2.413-1.504-1.674-1.301-.14.507-2.066.695-.744 1.218-1.197 1.109-1.39-.104-.186-.746-.137-.746-.137l-2.895.018s-.214-.029-.372.095c-.128.103-.207.333-.207.333s-.389 1.032-.906 1.911c-1.095 1.864-1.533 1.963-1.713.597-.065-.498-.978-2.094-.978-2.094s-.081-.186-.227-.286c-.175-.118-.419-.016-.419-.016l-2.901.018s-1.073.033-1.466.5c-.321.381-.021 1.164-.021 1.164s1.658 3.109 3.526 4.676c1.718 1.468 3.67 1.371 3.67 1.371h.857z"/>';
    htmlContent += '</svg>';
    htmlContent += 'VK: https://vk.com/tyumenkrasota72</div>';
    htmlContent += '<div class="contact-row">';
    htmlContent += '<svg width="16" height="16" viewBox="0 0 24 24" fill="#0088cc" style="vertical-align: middle; margin-right: 5px;">';
    htmlContent += '<path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>';
    htmlContent += '</svg>';
    htmlContent += 'Telegram: https://t.me/krasota72ru</div>';
    htmlContent += '<div class="contact-row"><strong>Дата формирования: ' + new Date().toLocaleDateString('ru-RU') + '</strong></div>';
    htmlContent += '</div>';
    htmlContent += '</div>';
    
    // Сортируем категории
    const sortedCategories = [...this.categories].sort((a, b) => 
      a.name.localeCompare(b.name, 'ru')
    );
    
    sortedCategories.forEach(category => {
      const categoryProducts = this.getCategoryProducts(category.id);
      
      if (categoryProducts.length > 0) {
        // Заголовок категории
        htmlContent += '<table>';
        htmlContent += '<tr>';
        htmlContent += '<td colspan="8" class="category-title">' + category.name + '</td>';
        htmlContent += '</tr>';
        htmlContent += '</table>';
        
        // Таблица товаров категории
        htmlContent += '<table>';
        htmlContent += '<thead>';
        htmlContent += '<tr>';
        htmlContent += '<th class="col-num">№</th>';
        htmlContent += '<th class="col-name">Название товара</th>';
        htmlContent += '<th class="col-sku">Артикул</th>';
        htmlContent += '<th class="col-price">Цена (₽)</th>';
        htmlContent += '<th class="col-color">Цвет</th>';
        htmlContent += '<th class="col-size">Размер</th>';
        htmlContent += '<th class="col-package">В упаковке</th>';
        htmlContent += '<th class="col-description">Описание</th>';
        htmlContent += '</tr>';
        htmlContent += '</thead>';
        htmlContent += '<tbody>';
        
        const sortedProducts = categoryProducts.sort((a, b) => 
          a.name.localeCompare(b.name, 'ru')
        );
        
        sortedProducts.forEach((product, index) => {
          // Формируем информацию о количестве в упаковке
          let packageInfo = '';
          if (product.package_quantity && product.package_quantity > 0) {
            const packageType = product.package_quantity_type || 'шт';
            packageInfo = `${product.package_quantity} ${packageType}`;
          } else {
            packageInfo = product.stock_type || '';
          }

          // Очищаем HTML теги из описания
          let description = (product.description || '').replace(/<[^>]*>/g, '');

          // Правильно определяем цвет (только если это действительно цвет)
          let color = '';
          if (product.color && 
              (product.color.toLowerCase().includes('белый') || 
               product.color.toLowerCase().includes('черный') ||
               product.color.toLowerCase().includes('красный') ||
               product.color.toLowerCase().includes('синий') ||
               product.color.toLowerCase().includes('зеленый') ||
               product.color.toLowerCase().includes('желтый') ||
               product.color.toLowerCase().includes('розовый') ||
               product.color.toLowerCase().includes('серый'))) {
            color = product.color;
          }

          htmlContent += '<tr>';
          htmlContent += '<td class="col-num">' + (index + 1) + '</td>';
          htmlContent += '<td class="col-name">' + this.escapeHtml(product.name) + '</td>';
          htmlContent += '<td class="col-sku">' + this.escapeHtml(product.sku || '') + '</td>';
          htmlContent += '<td class="col-price">' + product.price.toLocaleString('ru-RU') + '</td>';
          htmlContent += '<td class="col-color">' + this.escapeHtml(color) + '</td>';
          htmlContent += '<td class="col-size">' + this.escapeHtml(product.size || '') + '</td>';
          htmlContent += '<td class="col-package">' + this.escapeHtml(packageInfo) + '</td>';
          htmlContent += '<td class="col-description">' + this.escapeHtml(description) + '</td>';
          htmlContent += '</tr>';
        });
        
        htmlContent += '</tbody>';
        htmlContent += '</table>';
        htmlContent += '<br>';
      }
    });
    
    htmlContent += '</body>';
    htmlContent += '</html>';
    
    // Создаем blob и скачиваем
    const blob = new Blob(['\uFEFF' + htmlContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `price_list_${dateStr}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
