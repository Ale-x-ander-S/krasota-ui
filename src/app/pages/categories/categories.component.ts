import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer';
import { CategoryService, Category } from '../../services/category.service';
import { ProductService, Product } from '../../services/product.service';
import { CartAnimationService } from '../../services/cart-animation.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

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
  
  // Состояние развернутых категорий
  expandedCategories: Set<number> = new Set();

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private productService: ProductService,
    private cartAnimationService: CartAnimationService
  ) {
    // Инициализация PDFMake с поддержкой кириллицы
    (pdfMake as any).vfs = pdfFonts;
    
    // Настройка шрифтов для поддержки кириллицы
    (pdfMake as any).fonts = {
      Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
      }
    };
  }

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
      `/images/categories/${category.id}.jpg`,
      `/images/categories/${category.id}.png`,
      `/images/categories/${category.id}.webp`
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
    this.expandedCategories.clear(); // Сбрасываем развернутые категории при очистке фильтров
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

  // Переключает состояние развернутости категории
  toggleCategoryExpansion(categoryId: number): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  // Проверяет, развернута ли категория
  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategories.has(categoryId);
  }

  // Получает товары для отображения в категории (с учетом развернутого состояния)
  getDisplayedProductsForCategory(category: Category): Product[] {
    const searchedProducts = this.getSearchedProductsForCategory(category);
    const isExpanded = this.isCategoryExpanded(category.id);
    
    // Если категория развернута, показываем все найденные товары
    if (isExpanded) {
      return searchedProducts;
    }
    
    // Иначе показываем только первые 4 товара
    return searchedProducts.slice(0, 4);
  }

  // Получает количество скрытых товаров
  getHiddenProductsCount(category: Category): number {
    const searchedProducts = this.getSearchedProductsForCategory(category);
    const displayedCount = this.getDisplayedProductsForCategory(category).length;
    return Math.max(0, searchedProducts.length - displayedCount);
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

  // Генерация и скачивание прайс-листа в PDF
  downloadPriceListPDF() {
    if (this.products.length === 0) {
      alert('Нет товаров для скачивания');
      return;
    }

    try {
      // Загружаем логотип через fetch
      fetch('assets/images/lotus.png')
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            this.generatePDF(base64);
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {
          // Если логотип не загружается, генерируем без него
          this.generatePDF('');
        });
    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      alert('Ошибка при генерации PDF');
    }
  }

  private generatePDF(logoDataURL: string = '') {
    try {
      // Подготавливаем данные для таблицы
      const tableData: Array<any> = [];

      // Сортируем категории по ID
      const sortedCategories = [...this.categories].sort((a, b) => 
        a.id - b.id
      );

      // Группируем товары по категориям
      sortedCategories.forEach(category => {
        const categoryProducts = this.getCategoryProducts(category.id).filter(product => product.is_active);
        
        if (categoryProducts.length > 0) {
          // Добавляем заголовок категории
          tableData.push({
            name: category.name,
            price: '',
            isCategory: true
          });

          // Сортируем товары внутри категории по названию
          const sortedProducts = categoryProducts.sort((a, b) => 
            a.name.localeCompare(b.name, 'ru')
          );

          sortedProducts.forEach(product => {
            // Формируем название товара с выделением
            const productText: any[] = [
              { text: product.name, bold: true }
            ];
            
            // Добавляем дополнительную информацию
            const details = [];
            if (product.size) details.push(product.size);
            if (product.color) details.push(product.color);
            if (product.package_quantity && product.package_quantity > 0) {
              const packageType = product.package_quantity_type || 'шт';
              details.push(`${product.package_quantity} ${packageType}`);
            }
            
            if (details.length > 0) {
              productText.push({ text: ' (' + details.join(', ') + ')', bold: false });
            }

            tableData.push({
              name: productText,
              price: `${product.price} ₽`,
              isCategory: false
            });
          });
        }
      });

      // Создаем определение документа для PDFMake
      const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        defaultStyle: {
          font: 'Roboto',
          fontSize: 10
        },
        content: [
          // Заголовок с логотипом и контактами
          {
            columns: [
              {
                width: '*',
                stack: [
                  logoDataURL ? {
                    image: logoDataURL,
                    width: 200,
                    height: 50
                  } : {
                    text: '🌿',
                    fontSize: 25
                  }
                ]
              },
              {
                width: 'auto',
                text: [
                  'www.krasota72.ru\n',
                  '8 (912) 999-3766\n',
                  'krasota72tmn@gmail.com\n',
                  'vk.com/tyumenkrasota72\n',
                  't.me/krasota72ru\n',
                  'г. Тюмень, ул. Республики 249/8'
                ],
                fontSize: 9,
                alignment: 'right',
                margin: [20, 0, 0, 0]
              }
            ],
            margin: [0, 0, 0, 30]
          },

          // Заголовок прайс-листа
          {
            text: 'Прайс-лист товаров',
            fontSize: 18,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 20]
          },

          // Таблица товаров
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto'],
              body: [
                // Заголовки таблицы
                [
                  {
                    text: 'Название товара',
                    style: 'tableHeader'
                  },
                  {
                    text: 'Цена',
                    style: 'tableHeader'
                  }
                ],
                // Данные товаров
                ...tableData.map(item => [
                  {
                    text: item.name,
                    style: item.isCategory ? 'categoryHeader' : 'tableCell',
                    colSpan: item.isCategory ? 2 : 1,
                    alignment: item.isCategory ? 'left' : 'left'
                  },
                  item.isCategory ? {} : {
                    text: item.price,
                    style: 'tableCell',
                    alignment: 'right',
                    noWrap: true
                  }
                ])
              ]
            },
            layout: {
              fillColor: function (rowIndex: number, node: any) {
                if (rowIndex === 0) return '#48bb78'; // Заголовок таблицы
                
                // Проверяем, является ли строка заголовком категории
                const dataIndex = rowIndex - 1;
                if (dataIndex >= 0 && dataIndex < tableData.length) {
                  if (tableData[dataIndex].isCategory) {
                    return '#f0fdf4'; // Светло-зеленый фон для категорий
                  }
                }
                
                return rowIndex % 2 === 0 ? '#f8fafc' : null; // Четные строки
              },
              hLineWidth: function (i: number, node: any) {
                // Делаем линии под заголовками категорий толще
                if (i > 1) {
                  const dataIndex = i - 2;
                  if (dataIndex >= 0 && dataIndex < tableData.length && tableData[dataIndex].isCategory) {
                    return 2;
                  }
                }
                return i === 0 || i === 1 ? 1 : 0.5;
              },
              hLineColor: function (i: number) {
                return '#e2e8f0';
              }
            }
          }
        ],
        styles: {
          tableHeader: {
            fontSize: 12,
            bold: true,
            color: 'white',
            fillColor: '#48bb78'
          },
          categoryHeader: {
            fontSize: 12,
            bold: true,
            color: '#059669',
            fillColor: '#f0fdf4',
            margin: [8, 8, 8, 8]
          },
          tableCell: {
            fontSize: 10,
            margin: [5, 3, 5, 3]
          }
        }
      };

      // Генерируем и скачиваем PDF
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      pdfMake.createPdf(docDefinition).download(`price_list_${dateStr}.pdf`);
      
    } catch (error) {
      console.error('Ошибка генерации PDF:', error);
      alert('Ошибка при генерации PDF');
    }
  }
}
